const MappedModel = require("../mappedModel/MappedModel");
const modelMetadata = require("../model/modelMetadata");
const serializer = require("../model/serializer");

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
    const { historyDescription, ...rest } = args;
    const { rowName, scenarioName } = rest;
    super.addRow(rest);
    const description = historyDescription
      ? historyDescription
      : scenarioName
      ? `add row '${rowName}' to scenario '${scenarioName}'`
      : `add row '${rowName}'`;
    addToHistory(this.#history, {
      description,
      redo: {
        fn: "addRow",
        args: rest
      },
      undo: {
        fn: "deleteRow",
        args: {
          rowName,
          scenarioName
        }
      }
    });
  }

  addRows(args) {
    const { historyDescription, ...rest } = args;
    const { rows = [], scenarioName } = rest;
    super.addRows(rest);
    const rowNames = rows.map(({ rowName }) => rowName);
    const description = historyDescription
      ? historyDescription
      : scenarioName
      ? `add rows '${rowNames.join(", ")}' to scenario '${scenarioName}'`
      : `add rows '${rowNames.join(", ")}'`;
    addToHistory(this.#history, {
      description,
      redo: {
        fn: "addRows",
        args: rest
      },
      undo: {
        fn: "deleteRows",
        args: {
          rowNames,
          scenarioName
        }
      }
    });
  }

  updateRow(args) {
    const { historyDescription, ...rest } = args;
    const { rowName, scenarioName } = rest;
    const original = super.updateRow(rest);
    const description = historyDescription
      ? historyDescription
      : scenarioName
      ? `update row '${rowName}' on scenario '${scenarioName}'`
      : `update row '${rowName}'`;
    addToHistory(this.#history, {
      description,
      redo: {
        fn: "updateRow",
        args: rest
      },
      undo: {
        fn: "updateRow",
        args: { rowName, scenarioName, ...original }
      }
    });
  }

  patchRow(args) {
    const { historyDescription, ...rest } = args;
    const { rowName, scenarioName } = rest;
    const original = super.patchRow(rest);
    const description = historyDescription
      ? historyDescription
      : scenarioName
      ? `patch row '${rowName}' on scenario '${scenarioName}'`
      : `patch row '${rowName}'`;
    addToHistory(this.#history, {
      description,
      redo: {
        fn: "patchRow",
        args: rest
      },
      undo: {
        fn: "updateRow",
        args: { rowName, scenarioName, ...original }
      }
    });
  }

  deleteRow(args) {
    const { historyDescription, ...rest } = args;
    const { rowName, scenarioName } = rest;
    const { row, shadowRows } = super.deleteRow(rest);
    const description = historyDescription
      ? historyDescription
      : scenarioName
      ? `delete row '${rowName}' on scenario '${scenarioName}'`
      : `delete row '${rowName}'`;
    addToHistory(this.#history, {
      description,
      redo: {
        fn: "deleteRow",
        args: rest
      },
      undo: {
        fn: "addRow",
        args: { rowName, scenarioName, ...row }
      }
    });
    return { row, shadowRows };
  }

  deleteRows(args) {
    const { historyDescription, ...rest } = args;
    const { rowNames, scenarioName } = rest;
    const { rows } = super.deleteRows(rest);
    const description = historyDescription
      ? historyDescription
      : scenarioName
      ? `delete rows '${rowNames.join(", ")}' on scenario '${scenarioName}'`
      : `delete row '${rowNames.join(", ")}'`;
    addToHistory(this.#history, {
      description,
      redo: {
        fn: "deleteRows",
        args: rest
      },
      undo: {
        fn: rows => {
          rows.forEach(row => {
            super.addRow({ rowName: row.name, scenarioName, ...row });
          });
        },
        args: rows
      }
    });
  }

  addScenario(args = {}) {
    const { historyDescription, ...rest } = args;
    const { scenarioName } = rest;
    super.addScenario(rest);
    addToHistory(this.#history, {
      description: historyDescription || `add scenario '${scenarioName}'`,
      redo: {
        fn: "addScenario",
        args: rest
      },
      undo: {
        fn: "deleteScenario",
        args: {
          scenarioName
        }
      }
    });
  }

  deleteScenario(args = {}) {
    const { historyDescription, ...rest } = args;
    const { scenarioName } = rest;
    const original = super.deleteScenario(rest);
    addToHistory(this.#history, {
      description: historyDescription || `delete scenario '${scenarioName}'`,
      redo: {
        fn: "deleteScenario",
        args: rest
      },
      undo: {
        fn: "addScenario",
        args: {
          scenarioName,
          baseScenarioName: original
        }
      }
    });
  }

  undoOps() {
    return this.#history
      .slice(0, this.#history.current + 1)
      .map(item => item.description)
      .reverse();
  }

  redoOps() {
    return this.#history
      .slice(this.#history.current + 1)
      .map(item => item.description)
      .reverse();
  }

  undo() {
    if (this.#history.current < 0) {
      throw new Error("Nothing to undo.");
    }
    const { undo } = this.#history[this.#history.current];
    const { fn, args } = undo;
    if (typeof fn === "string") {
      super[fn](args);
    } else {
      fn(args);
    }
    this.#history.current = this.#history.current - 1;
  }

  redo() {
    if (this.#history.current === this.#history.length - 1) {
      throw new Error("Nothing to redo.");
    }
    const { redo } = this.#history[this.#history.current + 1];
    const { fn, args } = redo;
    super[fn](args);
    this.#history.current = this.#history.current + 1;
  }
}
InteractiveModel.maxHistoryItems = maxHistoryItems;

module.exports = InteractiveModel;
