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
  static parse([model, map], fnsRepo) {
    const meta = serializer.parse(model, fnsRepo);
    const keyMap = serializer.parse(map, fnsRepo);
    return new MappedModel(meta, keyMap);
  }

  #fns;

  constructor(meta, keyMap = { row: {}, scenario: {} }) {
    super(meta);
    const fromMap = keyMap;
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
      unmapError: unmapError.bind(this, fromMap),
      serializeMap: serializer.stringify.bind(this, fromMap)
    };
    this.#fns.mapRow = mapRow.bind(null, this.#fns.toRowKey);
  }

  addRow({
    rowKey,
    scenarioKey = defaultScenario,
    fn,
    fnArgs,
    constants,
    start,
    end,
    dependsOn
  }) {
    this.#fns.unmapError(callMappings => {
      super.addRow({
        scenarioKey: this.#fns.fromScenarioKey(scenarioKey, callMappings),
        rowKey: this.#fns.addRowKey(rowKey, callMappings),
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

  addRows({ rows = [], scenarioKey = defaultScenario }) {
    this.#fns.unmapError(callMappings => {
      const mapped = rows.map(row => ({
        ...row,
        rowKey: this.#fns.addRowKey(row.rowKey, callMappings),
        fnArgs: this.#fns.fromRowKey(row.fnArgs, callMappings),
        dependsOn: this.#fns.fromRowKey(
          row.dependsOn,
          callMappings,
          dependsOnErrorPrefix
        )
      }));
      super.addRows({
        scenarioKey: this.#fns.fromScenarioKey(scenarioKey, callMappings),
        rows: mapped
      });
    });
  }

  updateRow({
    rowKey,
    scenarioKey = defaultScenario,
    fn,
    fnArgs,
    constants,
    dependsOn
  }) {
    return this.#fns.unmapError(callMappings => {
      const originalRow = super.updateRow({
        scenarioKey: this.#fns.fromScenarioKey(scenarioKey, callMappings),
        rowKey: this.#fns.fromRowKey(rowKey, callMappings),
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
        scenarioKey,
        rowKey,
        dependsOn: this.#fns.toRowKey(originalRow.dependsOn, callMappings)
      };
    });
  }

  patchRow({
    rowKey,
    scenarioKey = defaultScenario,
    fn,
    fnArgs,
    constants,
    dependsOn
  }) {
    return this.#fns.unmapError(callMappings => {
      const originalRow = super.patchRow({
        scenarioKey: this.#fns.fromScenarioKey(scenarioKey, callMappings),
        rowKey: this.#fns.fromRowKey(rowKey, callMappings),
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
        scenarioKey,
        rowKey,
        dependsOn: this.#fns.toRowKey(originalRow.dependsOn, callMappings)
      };
    });
  }

  deleteRow({ rowKey, scenarioKey = defaultScenario }) {
    return this.#fns.unmapError(callMappings => {
      const { row, shadowRows } = super.deleteRow({
        scenarioKey: this.#fns.fromScenarioKey(scenarioKey, callMappings),
        rowKey: this.#fns.fromRowKey(rowKey, callMappings)
      });
      const mapped = {
        row: this.#fns.mapRow(row),
        shadowRows: shadowRows.map(this.#fns.mapRow)
      };
      // has row been deleted from every scenario?
      if (this.lengths.z === 1 + shadowRows.length) {
        this.#fns.removeRowKey(rowKey, callMappings);
      }
      return mapped;
    });
  }

  deleteRows({ rowKeys, scenarioKey = defaultScenario }) {
    return this.#fns.unmapError(callMappings => {
      const { rows, shadowRows } = super.deleteRows({
        scenarioKey: this.#fns.fromScenarioKey(scenarioKey, callMappings),
        rowKeys: this.#fns.fromRowKey(rowKeys, callMappings)
      });
      const mapped = {
        rows: rows.map(this.#fns.mapRow),
        shadowRows: shadowRows.map(this.#fns.mapRow)
      };
      // have rows been deleted from every scenario?
      if (this.lengths.z * rowKeys.length === rows.length + shadowRows.length) {
        this.#fns.removeRowKey(rowKeys, callMappings);
      }
      return mapped;
    });
  }

  row({ rowKey, scenarioKey = defaultScenario }) {
    return this.#fns.unmapError(callMappings => {
      return super.row({
        scenarioKey: this.#fns.fromScenarioKey(scenarioKey, callMappings),
        rowKey: this.#fns.fromRowKey(rowKey, callMappings)
      });
    });
  }

  scenario({ scenarioKey = defaultScenario } = {}) {
    return this.#fns.unmapError(callMappings => {
      return super.scenario({
        scenarioKey: this.#fns.fromScenarioKey(scenarioKey, callMappings)
      });
    });
  }

  addScenario(args = {}) {
    const { scenarioKey, baseScenarioName = defaultScenario } = args;
    this.#fns.unmapError(callMappings => {
      super.addScenario({
        ...args,
        scenarioKey: this.#fns.addScenarioKey(scenarioKey, callMappings),
        baseScenarioName: this.#fns.fromScenarioKey(
          baseScenarioName,
          callMappings
        )
      });
    });
  }

  deleteScenario({ scenarioKey } = {}) {
    this.#fns.unmapError(callMappings => {
      const mapped = this.#fns.fromScenarioKey(scenarioKey, callMappings);
      super.deleteScenario({
        scenarioKey: mapped
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
