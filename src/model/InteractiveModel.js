const MappedModel = require("./MappedModel");
const modelMetadata = require("./util/modelMetadata");
const serializer = require("./util/serializer");

const maxHistoryItems = 100;

const addToHistory = (history, item) => {
  if (history.current !== history.length - 1) {
    history.splice(history.current + 1);
  }
  history.push(item);
  if (history.length > maxHistoryItems) {
    history.shift();
  }
  history.current = history.length - 1;
};

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
    this.#history.current = -1;
  }

  addRow(args) {
    const { rowName, scenarioName } = args;
    super.addRow(args);
    addToHistory(this.#history, {
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
    const { rowName, scenarioName } = args;
    const original = super.updateRow(args);
    addToHistory(this.#history, {
      description: scenarioName
        ? `update row '${rowName}' on scenario '${scenarioName}'`
        : `update row '${rowName}'`,
      redo: {
        fn: this.updateRow,
        args
      },
      undo: {
        fn: this.updateRow,
        args: { rowName, scenarioName, ...original }
      }
    });
  }

  deleteRow(args) {
    const { rowName, scenarioName } = args;
    const original = super.deleteRow(args);
    addToHistory(this.#history, {
      description: scenarioName
        ? `delete row '${rowName}' on scenario '${scenarioName}'`
        : `delete row '${rowName}'`,
      redo: {
        fn: this.deleteRow,
        args
      },
      undo: {
        fn: this.addRow,
        args: { rowName, scenarioName, ...original }
      }
    });
  }

  deleteRows(args) {
    const { rowNames, scenarioName } = args;
    const originals = super.deleteRows(args);
    addToHistory(this.#history, {
      description: scenarioName
        ? `delete rows '${rowNames.join(", ")}' on scenario '${scenarioName}'`
        : `delete row '${rowNames.join(", ")}'`,
      redo: {
        fn: this.deleteRows,
        args
      },
      undo: {
        fn: () => {
          originals.forEach(row => {
            this.addRow({ rowName: row.name, scenarioName, ...row });
          });
        }
      }
    });
  }

  addScenario(args) {
    super.addScenario(args);
    const { scenarioName } = args;
    addToHistory(this.#history, {
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
    const original = super.deleteScenario(scenarioName);
    addToHistory(this.#history, {
      description: `delete scenario '${scenarioName}'`,
      redo: {
        fn: this.deleteScenario,
        scenarioName
      },
      undo: {
        fn: this.addScenario,
        args: {
          scenarioName,
          copyOf: original
        }
      }
    });
  }

  undoOps() {
    return this.#history
      .slice(0, this.#history.current + 1)
      .map(item => item.description);
  }

  redoOps() {
    return this.#history
      .slice(this.#history.current + 1)
      .map(item => item.description);
  }

  undo() {
    if (this.#history.current < 0) {
      throw new Error("Nothing to undo.");
    }
    this.#history.current = this.#history.current - 1;
  }

  redo() {
    if (this.#history.current === this.#history.length - 1) {
      throw new Error("Nothing to redo.");
    }
    this.#history.current = this.#history.current + 1;
  }
}

module.exports = InteractiveModel;
