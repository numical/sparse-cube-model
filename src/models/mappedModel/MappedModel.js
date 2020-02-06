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
      toScenarioKey: mapKey.bind(this, toMap, "scenario", defaultScenario),
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
      const { row, rowKeyStillInUse } = super.deleteRow({
        scenarioKey: this.#fns.fromScenarioKey(scenarioKey, callMappings),
        rowKey: this.#fns.fromRowKey(rowKey, callMappings)
      });
      const mapped = {
        row: this.#fns.mapRow(row),
        rowKeyStillInUse
      };
      // has row been deleted from every scenario?
      if (!rowKeyStillInUse) {
        this.#fns.removeRowKey(rowKey, callMappings);
      }
      return mapped;
    });
  }

  deleteRows({ rowKeys, scenarioKey = defaultScenario }) {
    return this.#fns.unmapError(callMappings => {
      const deletedRows = super.deleteRows({
        scenarioKey: this.#fns.fromScenarioKey(scenarioKey, callMappings),
        rowKeys: this.#fns.fromRowKey(rowKeys, callMappings)
      });
      deletedRows.forEach(({ row, rowKeyStillInUse }) => {
        if (!rowKeyStillInUse) {
          this.#fns.removeRowKey(row.key, callMappings);
        }
      });
      return deletedRows.map(({ row, rowKeyStillInUse }) => ({
        row: this.#fns.mapRow(row),
        rowKeyStillInUse
      }));
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

  scenario(args = { scenarioKey: defaultScenario }) {
    return this.#fns.unmapError(callMappings => {
      return super.scenario({
        ...args,
        scenarioKey: this.#fns.fromScenarioKey(args.scenarioKey, callMappings)
      });
    });
  }

  addScenario(args = {}) {
    const { scenarioKey, baseScenarioKey = defaultScenario, shadow } = args;
    this.#fns.unmapError(callMappings => {
      const mappedShadow = shadow
        ? {
            fn: shadow.fn,
            fnArgs: this.#fns.fromRowKey(shadow.fnArgs, callMappings),
            dependsOn: this.#fns.fromRowKey(
              shadow.dependsOn,
              callMappings,
              dependsOnErrorPrefix
            )
          }
        : undefined;
      super.addScenario({
        scenarioKey: this.#fns.addScenarioKey(scenarioKey, callMappings),
        baseScenarioKey: this.#fns.fromScenarioKey(
          baseScenarioKey,
          callMappings
        ),
        shadow: mappedShadow
      });
    });
  }

  deleteScenario({ scenarioKey } = {}) {
    return this.#fns.unmapError(callMappings => {
      const mapped = this.#fns.fromScenarioKey(scenarioKey, callMappings);
      const { baseScenarioKey, shadow, ...rest } = super.deleteScenario({
        scenarioKey: mapped
      });
      this.#fns.removeScenarioKey(mapped, callMappings);
      const mappedShadow = shadow
        ? {
            ...shadow,
            dependsOn: shadow.dependsOn
              ? this.#fns.toRowKey(shadow.dependsOn)
              : undefined
          }
        : undefined;
      return {
        ...rest,
        baseScenarioKey: this.#fns.toScenarioKey(baseScenarioKey),
        shadow: mappedShadow
      };
    });
  }

  stringify(args) {
    const model = super.stringify(args);
    const map = this.#fns.serializeMap(args);
    return [model, map];
  }
}

module.exports = MappedModel;
