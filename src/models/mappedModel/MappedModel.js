const { invertObj } = require("ramda");
const Model = require("../model/Model");
const modelMetadata = require("../model/internal/modelMetadata");
const serializer = require("../model/internal/serializer");
const addKey = require("./internal/addKey");
const removeKey = require("./internal/removeKey");
const mapKey = require("./internal/mapKey");
const unmapError = require("./internal/unmapError");
const { defaultScenario } = modelMetadata;

class MappedModel extends Model {
  static parse([serializedModel, serializedMap], fnsRepo) {
    const meta = serializer.parse(serializedModel, fnsRepo);
    const map = serializer.parse(serializedMap, fnsRepo);
    return new MappedModel(meta, map);
  }

  #fns;

  constructor(meta, fromMap = { row: {}, scenario: {} }) {
    super(meta);
    const toMap = {
      row: invertObj(fromMap.row),
      scenario: invertObj(fromMap.scenario)
    };
    this.#fns = {
      addRowKey: addKey.bind(this, fromMap, toMap, "row", ""),
      addScenarioKey: addKey.bind(
        this,
        fromMap,
        toMap,
        "scenario",
        defaultScenario
      ),
      removeRowKey: removeKey.bind(this, fromMap, toMap, "row"),
      removeScenarioKey: removeKey.bind(this, fromMap, toMap, "scenario"),
      fromRowKey: mapKey.bind(this, fromMap, "row", ""),
      fromScenarioKey: mapKey.bind(this, fromMap, "scenario", defaultScenario),
      toRowKey: mapKey.bind(this, toMap, "row", ""),
      unmapError: unmapError.bind(this, fromMap.row),
      serializeMap: serializer.stringify.bind(this, fromMap)
    };
  }

  addRow({
    rowName,
    scenarioName = defaultScenario,
    fn,
    fnArgs,
    constants,
    start,
    end,
    dependsOn
  }) {
    this.#fns.unmapError(callMappings => {
      super.addRow({
        scenarioName: this.#fns.fromScenarioKey(scenarioName, callMappings),
        rowName: this.#fns.addRowKey(rowName, callMappings),
        fn,
        fnArgs: this.#fns.fromRowKey(fnArgs, callMappings),
        constants,
        start,
        end,
        dependsOn: this.#fns.fromRowKey(dependsOn, callMappings)
      });
    });
  }

  updateRow({
    rowName,
    scenarioName = defaultScenario,
    fn,
    fnArgs,
    constants,
    dependsOn
  }) {
    return this.#fns.unmapError(callMappings => {
      const originalRow = super.updateRow({
        scenarioName: this.#fns.fromScenarioKey(scenarioName, callMappings),
        rowName: this.#fns.fromRowKey(rowName, callMappings),
        fn,
        fnArgs: this.#fns.fromRowKey(fnArgs, callMappings),
        constants,
        dependsOn: this.#fns.fromRowKey(dependsOn, callMappings)
      });
      return originalRow;
    });
  }

  deleteRow({ rowName, scenarioName = defaultScenario }) {
    return this.#fns.unmapError(callMappings => {
      const deletedRow = super.deleteRow({
        scenarioName: this.#fns.fromScenarioKey(scenarioName, callMappings),
        rowName: this.#fns.fromRowKey(rowName, callMappings)
      });
      const mapped = {
        ...deletedRow,
        name: this.#fns.toRowKey(deletedRow.name),
        dependsOn: this.#fns.toRowKey(deletedRow.dependsOn)
      };
      this.#fns.removeRowKey(rowName, callMappings);
      return mapped;
    });
  }

  deleteRows({ rowNames, scenarioName = defaultScenario }) {
    return this.#fns.unmapError(callMappings => {
      const deletedRows = super
        .deleteRows({
          scenarioName: this.#fns.fromScenarioKey(scenarioName, callMappings),
          rowNames: this.#fns.fromRowKey(rowNames, callMappings)
        })
        .map(deletedRow => ({
          ...deletedRow,
          name: this.#fns.toRowKey(deletedRow.name),
          dependsOn: this.#fns.toRowKey(deletedRow.dependsOn)
        }));
      this.#fns.removeRowKey(rowNames, callMappings);
      return deletedRows;
    });
  }

  row({ rowName, scenarioName = defaultScenario }) {
    return this.#fns.unmapError(callMappings => {
      return super.row({
        scenarioName: this.#fns.fromScenarioKey(scenarioName, callMappings),
        rowName: this.#fns.fromRowKey(rowName, callMappings)
      });
    });
  }

  scenario({ scenarioName = defaultScenario } = {}) {
    return this.#fns.unmapError(callMappings => {
      return super.scenario({
        scenarioName: this.#fns.fromScenarioKey(scenarioName, callMappings)
      });
    });
  }

  addScenario({ scenarioName, copyOf = defaultScenario } = {}) {
    this.#fns.unmapError(callMappings => {
      super.addScenario({
        scenarioName: this.#fns.addScenarioKey(scenarioName, callMappings),
        copyOf: this.#fns.fromScenarioKey(copyOf, callMappings)
      });
    });
  }

  deleteScenario(scenarioName) {
    return this.#fns.unmapError(callMappings => {
      const mapped = this.#fns.fromScenarioKey(scenarioName, callMappings);
      const deletedScenario = super.deleteScenario(mapped);
      this.#fns.removeScenarioKey(mapped, callMappings);
      return deletedScenario;
    });
  }

  stringify(args) {
    const model = super.stringify(args);
    const map = this.#fns.serializeMap(args);
    return [model, map];
  }
}

module.exports = MappedModel;
