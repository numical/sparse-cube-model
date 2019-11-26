const Model = require("./Model");
const uuid = require("./uuid");
const modelMetadata = require("./modelMetadata");
const { defaultScenario } = modelMetadata;

class MappedModel extends Model {
  #addKey;
  #removeKey;
  #fromKey;

  constructor(meta, obfuscator = uuid) {
    super(meta);
    const toKey = {};
    const fromKey = {};
    this.#addKey = (key, doNotObfuscate) => {
      const obfuscated = key === doNotObfuscate ? key : obfuscator(key);
      toKey[obfuscated] = key;
      fromKey[key] = obfuscated;
      return obfuscated;
    };
    this.#removeKey = key => {
      const obfuscated = fromKey[key];
      delete toKey[obfuscated];
      delete fromKey[key];
    };
    this.#fromKey = key =>
      key === undefined
        ? undefined
        : Array.isArray(key)
        ? key.map(this.#fromKey)
        : key.reference
        ? { ...key, reference: this.#fromKey(key.reference) }
        : fromKey[key];
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
    super.addRow({
      rowName: this.#addKey(rowName),
      scenarioName: this.#addKey(scenarioName, defaultScenario),
      startInterval,
      endInterval,
      fn,
      fnArgs: this.#fromKey(fnArgs),
      constants,
      dependsOn: this.#fromKey(dependsOn)
    });
  }

  updateRow({
    rowName,
    scenarioName = defaultScenario,
    fn,
    fnArgs,
    constants
  }) {
    super.updateRow({
      rowName: this.#fromKey(rowName),
      scenarioName: this.#fromKey(scenarioName),
      fn,
      fnArgs: this.#fromKey(fnArgs),
      constants
    });
  }

  deleteRow({ rowName, scenarioName = defaultScenario }) {
    super.deleteRow({
      rowName: this.#fromKey(rowName),
      scenarioName: this.#fromKey(scenarioName)
    });
  }

  deleteRows({ rowNames, scenarioName = defaultScenario }) {
    super.deleteRows({
      rowNames: this.#fromKey(rowNames),
      scenarioName: this.#fromKey(scenarioName)
    });
  }

  row({ rowName, scenarioName = defaultScenario }) {
    return super.row({
      rowName: this.#fromKey(rowName),
      scenarioName: this.#fromKey(scenarioName)
    });
  }

  addScenario({ scenarioName, copyOf = defaultScenario }) {
    super.addScenario({
      scenarioName: this.#addKey(scenarioName, defaultScenario),
      copyOf: this.#fromKey(copyOf)
    });
  }

  deleteScenario(scenarioName) {
    super.deleteScenario(this.#fromKey(scenarioName));
  }
}

module.exports = MappedModel;
