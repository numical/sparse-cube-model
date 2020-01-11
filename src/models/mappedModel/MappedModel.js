const { invertObj } = require("ramda");
const Model = require("../model/Model");
const modelMetadata = require("../model/modelMetadata");
const serializer = require("../model/serializer");
const addKey = require("./internal/addKey");
const removeKey = require("./internal/removeKey");
const mapKey = require("./internal/mapKey");
const mapRow = require("./internal/mapRow");
const unmapError = require("./internal/unmapError");
const { defaultScenario } = modelMetadata;

const dependsOnErrorPrefix = "Depends on unknown row";

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
    this.#fns.mapRow = mapRow.bind(null, this.#fns.toRowKey);
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
        dependsOn: this.#fns.fromRowKey(
          dependsOn,
          callMappings,
          dependsOnErrorPrefix
        )
      });
    });
  }

  addRows({ rows = [], scenarioName = defaultScenario }) {
    this.#fns.unmapError(callMappings => {
      const mapped = rows.map(row => ({
        ...row,
        rowName: this.#fns.addRowKey(row.rowName, callMappings),
        fnArgs: this.#fns.fromRowKey(row.fnArgs, callMappings),
        dependsOn: this.#fns.fromRowKey(
          row.dependsOn,
          callMappings,
          dependsOnErrorPrefix
        )
      }));
      super.addRows({
        scenarioName: this.#fns.fromScenarioKey(scenarioName, callMappings),
        rows: mapped
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
        dependsOn: this.#fns.fromRowKey(
          dependsOn,
          callMappings,
          dependsOnErrorPrefix
        )
      });
      return {
        ...originalRow,
        scenarioName,
        rowName,
        dependsOn: this.#fns.toRowKey(originalRow.dependsOn, callMappings)
      };
    });
  }

  patchRow({
    rowName,
    scenarioName = defaultScenario,
    fn,
    fnArgs,
    constants,
    dependsOn
  }) {
    return this.#fns.unmapError(callMappings => {
      const originalRow = super.patchRow({
        scenarioName: this.#fns.fromScenarioKey(scenarioName, callMappings),
        rowName: this.#fns.fromRowKey(rowName, callMappings),
        fn,
        fnArgs: this.#fns.fromRowKey(fnArgs, callMappings),
        constants,
        dependsOn: this.#fns.fromRowKey(
          dependsOn,
          callMappings,
          dependsOnErrorPrefix
        )
      });
      return {
        ...originalRow,
        scenarioName,
        rowName,
        dependsOn: this.#fns.toRowKey(originalRow.dependsOn, callMappings)
      };
    });
  }

  deleteRow({ rowName, scenarioName = defaultScenario }) {
    return this.#fns.unmapError(callMappings => {
      const { row, shadowRows } = super.deleteRow({
        scenarioName: this.#fns.fromScenarioKey(scenarioName, callMappings),
        rowName: this.#fns.fromRowKey(rowName, callMappings)
      });
      const mapped = {
        row: this.#fns.mapRow(row),
        shadowRows: shadowRows.map(this.#fns.mapRow)
      };
      // has row been deleted from every scenario?
      if (this.lengths.z === 1 + shadowRows.length) {
        this.#fns.removeRowKey(rowName, callMappings);
      }
      return mapped;
    });
  }

  deleteRows({ rowNames, scenarioName = defaultScenario }) {
    const mapRow = row => ({
      ...row,
      name: this.#fns.toRowKey(row.name),
      dependsOn: this.#fns.toRowKey(row.dependsOn)
    });
    return this.#fns.unmapError(callMappings => {
      const { rows, shadowRows } = super.deleteRows({
        scenarioName: this.#fns.fromScenarioKey(scenarioName, callMappings),
        rowNames: this.#fns.fromRowKey(rowNames, callMappings)
      });
      const mapped = {
        rows: rows.map(this.#fns.mapRow),
        shadowRows: shadowRows.map(this.#fns.mapRow)
      };
      // have rows been deleted from every scenario?
      if (
        this.lengths.z * rowNames.length ===
        rows.length + shadowRows.length
      ) {
        this.#fns.removeRowKey(rowNames, callMappings);
      }
      return mapped;
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

  addScenario(args = {}) {
    const { scenarioName, baseScenarioName = defaultScenario } = args;
    this.#fns.unmapError(callMappings => {
      super.addScenario({
        ...args,
        scenarioName: this.#fns.addScenarioKey(scenarioName, callMappings),
        baseScenarioName: this.#fns.fromScenarioKey(
          baseScenarioName,
          callMappings
        )
      });
    });
  }

  deleteScenario({ scenarioName } = {}) {
    this.#fns.unmapError(callMappings => {
      const mapped = this.#fns.fromScenarioKey(scenarioName, callMappings);
      super.deleteScenario({
        scenarioName: mapped
      });
      this.#fns.removeScenarioKey(mapped, callMappings);
    });
  }

  stringify(args) {
    const model = super.stringify(args);
    const map = this.#fns.serializeMap(args);
    return [model, map];
  }
}

module.exports = MappedModel;
