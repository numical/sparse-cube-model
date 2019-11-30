const Model = require("./Model");
const mappingGenerator = require("nanoid/non-secure").bind(null, 10);
const modelMetadata = require("./modelMetadata");
const serializer = require("./serializer");
const { defaultScenario } = modelMetadata;

const addKey = (type, fromMap, callMappings, key, doNotMap) => {
  if (!key) {
    throw new Error(`A ${type} name is required.`);
  } else if (fromMap[type][key]) {
    const mapped = fromMap[type][key];
    callMappings[mapped] = key;
    return mapped;
  } else {
    const mapped = key === doNotMap ? key : mappingGenerator();
    fromMap[type][key] = mapped;
    callMappings[mapped] = key;
    return mapped;
  }
};

const removeKey = (type, fromMap, callMappings, key) => {
  if (Array.isArray(key)) {
    key.map(removeKey.bind(null, type, fromMap, callMappings));
  } else {
    const mapped = fromMap[type][key];
    delete fromMap[type][key];
    callMappings[mapped] = key;
  }
};

const fromKey = (type, fromMap, callMappings, key, doNotMap) => {
  if (key) {
    if (key === doNotMap) {
      return key;
    } else if (Array.isArray(key)) {
      return key.map(fromKey.bind(null, type, fromMap, callMappings));
    } else if (typeof key === "object") {
      if (key.reference) {
        // if an object (fnArgs probably) which has a 'reference' property
        const mapped = fromMap[type][key.reference];
        callMappings[mapped] = key;
        return { ...key, reference: mapped };
      } else {
        return key;
      }
    } else {
      const mapped = fromMap[type][key];
      if (!mapped) {
        throw new Error(`Unknown ${type} '${key}'`);
      }
      callMappings[mapped] = key;
      return mapped;
    }
  }
};

const unmapMessage = (message, callMappings, fromMap) => {
  let unmapped = Object.entries(callMappings).reduce(
    (message, [mapped, key]) => message.replace(mapped, key),
    message
  );
  if (fromMap) {
    unmapped = Object.entries(fromMap).reduce(
      (message, [key, mapped]) => message.replace(mapped, key),
      unmapped
    );
  }
  return unmapped;
};

const unmapError = (fn, fromMap) => {
  const callMappings = {};
  try {
    return fn(callMappings);
  } catch (error) {
    error.message = unmapMessage(error.message, callMappings, fromMap);
    throw error;
  }
};

class MappedModel extends Model {
  static parse([serializedModel, serializedMap], fnsRepo) {
    const meta = serializer.parse(serializedModel, fnsRepo);
    const map = serializer.parse(serializedMap, fnsRepo);
    return new MappedModel(meta, map);
  }

  #fromMap;

  constructor(meta, map = { row: {}, scenario: {} }) {
    super(meta);
    this.#fromMap = map;
  }

  addRow({
    rowName,
    scenarioName = defaultScenario,
    startInterval,
    endInterval,
    fn,
    fnArgs,
    constants,
    dependsOn
  }) {
    unmapError(callMappings => {
      super.addRow({
        scenarioName: fromKey(
          "scenario",
          this.#fromMap,
          callMappings,
          scenarioName,
          defaultScenario
        ),
        rowName: addKey("row", this.#fromMap, callMappings, rowName),
        startInterval,
        endInterval,
        fn,
        fnArgs: fromKey("row", this.#fromMap, callMappings, fnArgs),
        constants,
        dependsOn: fromKey("row", this.#fromMap, callMappings, dependsOn)
      });
    });
  }

  updateRow({
    rowName,
    scenarioName = defaultScenario,
    fn,
    fnArgs,
    constants
  }) {
    unmapError(callMappings => {
      super.updateRow({
        scenarioName: fromKey(
          "scenario",
          this.#fromMap,
          callMappings,
          scenarioName,
          defaultScenario
        ),
        rowName: fromKey("row", this.#fromMap, callMappings, rowName),
        fn,
        fnArgs: fromKey("row", this.#fromMap, callMappings, fnArgs),
        constants
      });
    });
  }

  deleteRow({ rowName, scenarioName = defaultScenario }) {
    unmapError(callMappings => {
      super.deleteRow({
        scenarioName: fromKey(
          "scenario",
          this.#fromMap,
          callMappings,
          scenarioName,
          defaultScenario
        ),
        rowName: fromKey("row", this.#fromMap, callMappings, rowName)
      });
      removeKey("row", this.#fromMap, callMappings, rowName);
    }, this.#fromMap.row);
  }

  deleteRows({ rowNames, scenarioName = defaultScenario }) {
    unmapError(callMappings => {
      super.deleteRows({
        scenarioName: fromKey(
          "scenario",
          this.#fromMap,
          callMappings,
          scenarioName,
          defaultScenario
        ),
        rowNames: fromKey("row", this.#fromMap, callMappings, rowNames)
      });
      removeKey("row", this.#fromMap, callMappings, rowNames);
    }, this.#fromMap.row);
  }

  row({ rowName, scenarioName = defaultScenario }) {
    return unmapError(callMappings => {
      return super.row({
        scenarioName: fromKey(
          "scenario",
          this.#fromMap,
          callMappings,
          scenarioName,
          defaultScenario
        ),
        rowName: fromKey("row", this.#fromMap, callMappings, rowName)
      });
    });
  }

  addScenario({ scenarioName, copyOf = defaultScenario } = {}) {
    unmapError(callMappings => {
      super.addScenario({
        scenarioName: addKey(
          "scenario",
          this.#fromMap,
          callMappings,
          scenarioName,
          defaultScenario
        ),
        copyOf: fromKey(
          "scenario",
          this.#fromMap,
          callMappings,
          copyOf,
          defaultScenario
        )
      });
    });
  }

  deleteScenario(scenarioName) {
    unmapError(callMappings => {
      const mapped = fromKey(
        "scenario",
        this.#fromMap,
        callMappings,
        scenarioName,
        defaultScenario
      );
      super.deleteScenario(mapped);
      removeKey("scenario", this.#fromMap, callMappings, mapped);
    });
  }

  stringify(args) {
    const model = super.stringify(args);
    const map = serializer.stringify(this.#fromMap, args);
    return [model, map];
  }
}

module.exports = MappedModel;
