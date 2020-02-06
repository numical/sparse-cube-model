const MappedModel = require("../mappedModel/MappedModel");
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
  static parse([model, map], fnsRepo) {
    const meta = serializer.parse(model, fnsRepo);
    const keyMap = serializer.parse(map, fnsRepo);
    return new InteractiveModel(meta, keyMap);
  }

  #history;

  constructor(meta, keyMap) {
    super(meta, keyMap);
    this.#history = [];
    this.#history.current = -1;
  }

  addRow(args) {
    const { historyDescription, ...rest } = args;
    const { rowKey, scenarioKey } = rest;
    super.addRow(rest);
    const description = historyDescription
      ? historyDescription
      : scenarioKey
      ? `add row '${rowKey}' to scenario '${scenarioKey}'`
      : `add row '${rowKey}'`;
    addToHistory(this.#history, {
      description,
      redo: {
        fn: "addRow",
        args: rest
      },
      undo: {
        fn: "deleteRow",
        args: {
          rowKey,
          scenarioKey
        }
      }
    });
  }

  addRows(args) {
    const { historyDescription, ...rest } = args;
    const { rows = [], scenarioKey } = rest;
    super.addRows(rest);
    const rowKeys = rows.map(({ rowKey }) => rowKey);
    const description = historyDescription
      ? historyDescription
      : scenarioKey
      ? `add rows '${rowKeys.join(", ")}' to scenario '${scenarioKey}'`
      : `add rows '${rowKeys.join(", ")}'`;
    addToHistory(this.#history, {
      description,
      redo: {
        fn: "addRows",
        args: rest
      },
      undo: {
        fn: "deleteRows",
        args: {
          rowKeys,
          scenarioKey
        }
      }
    });
  }

  updateRow(args) {
    const { historyDescription, ...rest } = args;
    const { rowKey, scenarioKey } = rest;
    const original = super.updateRow(rest);
    const description = historyDescription
      ? historyDescription
      : scenarioKey
      ? `update row '${rowKey}' on scenario '${scenarioKey}'`
      : `update row '${rowKey}'`;
    addToHistory(this.#history, {
      description,
      redo: {
        fn: "updateRow",
        args: rest
      },
      undo: {
        fn: "updateRow",
        args: { rowKey, scenarioKey, ...original }
      }
    });
  }

  patchRow(args) {
    const { historyDescription, ...rest } = args;
    const { rowKey, scenarioKey } = rest;
    const original = super.patchRow(rest);
    const description = historyDescription
      ? historyDescription
      : scenarioKey
      ? `patch row '${rowKey}' on scenario '${scenarioKey}'`
      : `patch row '${rowKey}'`;
    addToHistory(this.#history, {
      description,
      redo: {
        fn: "patchRow",
        args: rest
      },
      undo: {
        fn: "updateRow",
        args: { rowKey, scenarioKey, ...original }
      }
    });
  }

  deleteRow(args) {
    const { historyDescription, ...rest } = args;
    const { rowKey, scenarioKey } = rest;
    const { row, rowKeyStillInUse } = super.deleteRow(rest);
    const description = historyDescription
      ? historyDescription
      : scenarioKey
      ? `delete row '${rowKey}' on scenario '${scenarioKey}'`
      : `delete row '${rowKey}'`;
    addToHistory(this.#history, {
      description,
      redo: {
        fn: "deleteRow",
        args: rest
      },
      undo: {
        fn: "addRow",
        args: { rowKey, scenarioKey, ...row }
      }
    });
    return { row, rowKeyStillInUse };
  }

  deleteRows(args) {
    const { historyDescription, ...rest } = args;
    const { rowKeys, scenarioKey } = rest;
    const deletedRows = super.deleteRows(rest);
    const description = historyDescription
      ? historyDescription
      : scenarioKey
      ? `delete rows '${rowKeys.join(", ")}' on scenario '${scenarioKey}'`
      : `delete row '${rowKeys.join(", ")}'`;
    addToHistory(this.#history, {
      description,
      redo: {
        fn: "deleteRows",
        args: rest
      },
      undo: {
        fn: rows => {
          rows.forEach(row => {
            super.addRow({ rowKey: row.key, scenarioKey, ...row });
          });
        },
        args: deletedRows.map(({ row }) => row)
      }
    });
  }

  addScenario(args = {}) {
    const { historyDescription, ...rest } = args;
    const { scenarioKey } = rest;
    super.addScenario(rest);
    addToHistory(this.#history, {
      description: historyDescription || `add scenario '${scenarioKey}'`,
      redo: {
        fn: "addScenario",
        args: rest
      },
      undo: {
        fn: "deleteScenario",
        args: {
          scenarioKey
        }
      }
    });
  }

  deleteScenario(args = {}) {
    const { historyDescription, ...rest } = args;
    const { scenarioKey } = rest;
    const { baseScenarioKey, shadow } = super.deleteScenario(rest);
    addToHistory(this.#history, {
      description: historyDescription || `delete scenario '${scenarioKey}'`,
      redo: {
        fn: "deleteScenario",
        args: rest
      },
      undo: {
        fn: "addScenario",
        args: {
          scenarioKey,
          baseScenarioKey,
          shadow
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
