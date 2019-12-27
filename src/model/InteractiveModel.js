const MappedModel = require("./MappedModel");
const mappingGenerator = require("nanoid/non-secure").bind(null, 10);
const modelMetadata = require("./util/modelMetadata");
const serializer = require("./util/serializer");
const { defaultScenario } = modelMetadata;

class InteractiveModel extends MappedModel {
  static parse([serializedModel, serializedMap], fnsRepo) {
    const meta = serializer.parse(serializedModel, fnsRepo);
    const map = serializer.parse(serializedMap, fnsRepo);
    return new InteractiveModel(meta, map);
  }

  #history;

  constructor(meta, map) {
    super(meta, map);
    this.#history = [];
  }

  addRow(args) {
    const { rowName, scenarioName } = args;
    super.addRow(args);
    this.#history.push({
      description: scenarioName
        ? `add row '${rowName}' to scenario '${scenarioName}'`
        : `add row '${rowName}'`,
      redo: {
        fn: this.addRow,
        args
      },
      undo: {
        fn: this.deleteRow,
        args: {
          rowName,
          scenarioName
        }
      }
    });
  }

  updateRow(args) {
    super.updateRow(args);
  }

  deleteRow(args) {
    super.deleteRow(args);
  }

  deleteRows(args) {
    super.deleteRows(args);
  }

  addScenario(args) {
    super.addScenario(args);
    const { scenarioName } = args;
    this.#history.push({
      description: `add scenario '${scenarioName}'`,
      redo: {
        fn: this.addScenario,
        args
      },
      undo: {
        fn: this.deleteScenario,
        args: {
          scenarioName
        }
      }
    });
  }

  deleteScenario(scenarioName) {
    super.deleteScenario(scenarioName);
  }
}

module.exports = InteractiveModel;
