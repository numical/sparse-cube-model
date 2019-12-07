const tap = require("tap");
const Model = require("../Model");
const MappedModel = require("../MappedModel");
const { increment, interval } = require("../../fns/coreFunctions");

const sequence = (length, mapFn = (_, i) => i) => Array.from({ length }, mapFn);

const count = 10;
const testDefaults = {
  intervals: {
    count
  }
};

[Model, MappedModel].forEach(Type => {
  tap.test(`${Type.name} tests: `, typeTests => {
    const { test, only } = typeTests;
    test("Add row with unknown scenario throws error", t => {
      const rowName = "test row";
      const fn = () => {};
      const scenarioName = "unknown test scenario";
      const args = { rowName, fn, scenarioName };

      const model = new Type(testDefaults);
      t.throws(
        () => model.addRow(args),
        new Error("Unknown scenario 'unknown test scenario'")
      );
      t.end();
    });

    test("Add row with function with no key throws error", t => {
      const rowName = "test row";
      const fn = () => {};
      const args = { rowName, fn };

      const model = new Type(testDefaults);
      t.throws(
        () => model.addRow(args),
        new Error("function 'fn' must have a 'key' property.")
      );
      t.end();
    });

    test("Add row with existing name throws error", t => {
      const rowName = "test row";
      const fn = () => () => {};
      fn.key = "test fn";
      const args = { rowName, fn };

      const model = new Type(testDefaults);
      model.addRow(args);
      t.throws(
        () => model.addRow(args),
        new Error("Scenario 'defaultScenario' already has row 'test row'")
      );
      t.end();
    });

    test("Add row with no name throws error", t => {
      const fn = () => () => {};
      fn.key = "test fn";
      const args = { fn };

      const model = new Type(testDefaults);
      t.throws(() => model.addRow(args), new Error("A row name is required"));
      t.end();
    });

    test("Add row with no function and smaller constants array than intervals throws error", t => {
      const model = new Type(testDefaults);
      const args = { rowName: "test row", constants: [0] };
      t.throws(
        () => model.addRow(args),
        new Error("Row has no function, but less constants than intervals.")
      );
      t.end();
    });

    test("Add row with no function and fewer constants that intervals throws error", t => {
      const model = new Type(testDefaults);
      const args = { rowName: "test row", constants: { 0: 5 } };
      t.throws(
        () => model.addRow(args),
        new Error("Row has no function, but less constants than intervals.")
      );
      t.end();
    });

    test("Add row with no function and undefined constants", t => {
      const model = new Type(testDefaults);
      const constants = [0, 1, 2, 3, 4, 5, 6, undefined, 8, 9];
      const args = { rowName: "test row", constants };
      t.throws(
        () => model.addRow(args),
        new Error("Row has no function, but undefined constants.")
      );
      t.end();
    });

    test("Add row of constants", t => {
      const rowName = "test row";
      const constants = sequence(count);
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants
      });
      for (let i = 0; i < count; i++) {
        t.equal(model[i][0][0], constants[i]);
      }
      t.end();
    });

    test("retrieve added row of constants", t => {
      const rowName = "test row";
      const constants = sequence(count);
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants
      });
      const row = model.row({ rowName });
      t.same(row, constants);
      t.end();
    });

    test("Add partial constants via object", t => {
      const rowName = "test row";
      const constants = {
        1: 10,
        3: 10,
        7: 10
      };
      const expected = [0, 10, 2, 10, 4, 5, 6, 10, 8, 9];
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        fn: interval
      });
      const row = model.row({ rowName });
      t.same(row, expected);
      t.end();
    });

    test("Add partial constants via Map", t => {
      const rowName = "test row";
      const constants = new Map([
        [1, 10],
        [3, 10],
        [7, 10]
      ]);
      const expected = [0, 10, 2, 10, 4, 5, 6, 10, 8, 9];
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        fn: interval
      });
      const row = model.row({ rowName });
      t.same(row, expected);
      t.end();
    });

    test("Add partial constants via object fails if keys are not integers", t => {
      const rowName = "test row";
      const constants = {
        1: 10,
        a: 10,
        7: 10
      };
      const model = new Type(testDefaults);
      const args = { rowName: "test row", constants, fn: interval };
      t.throws(() => {
        model.addRow(args);
      }, new Error("Constant key 'a' must be an integer."));
      t.end();
    });

    test("Add partial constants via Map fails if keys are not integers", t => {
      const rowName = "test row";
      const constants = new Map([
        [1, 10],
        ["a", 10],
        [7, 10]
      ]);
      const model = new Type(testDefaults);
      const args = { rowName: "test row", constants, fn: interval };
      t.throws(() => {
        model.addRow(args);
      }, new Error("Constant key 'a' must be an integer."));
      t.end();
    });

    test("Add partial constants via object fails if indices greater than interval count", t => {
      const rowName = "test row";
      const constants = {
        1: 10,
        11: 10,
        7: 10
      };
      const model = new Type(testDefaults);
      const args = { rowName: "test row", constants, fn: interval };
      t.throws(() => {
        model.addRow(args);
      }, new Error("Constant index 11 must be 9 or less."));
      t.end();
    });

    test("Add partial constants via Map fails if indices greater than interval count", t => {
      const rowName = "test row";
      const constants = new Map([
        [1, 10],
        [11, 10],
        [7, 10]
      ]);
      const model = new Type(testDefaults);
      const args = { rowName: "test row", constants, fn: interval };
      t.throws(() => {
        model.addRow(args);
      }, new Error("Constant index 11 must be 9 or less."));
      t.end();
    });

    test("retrieve row fails if unknown row name", t => {
      const rowName = "test row";
      const constants = sequence(count);
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants
      });
      t.throws(
        () => model.row({ rowName: "unknown row" }),
        new Error("Unknown row 'unknown row'")
      );
      t.end();
    });

    test("retrieve row fails if unknown scenario name", t => {
      const rowName = "test row";
      const constants = sequence(count);
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants
      });
      t.throws(
        () => model.row({ rowName, scenarioName: "unknown scenario" }),
        new Error("Unknown scenario 'unknown scenario'")
      );
      t.end();
    });

    test("Add sequence row using zero initial constant", t => {
      const rowName = "test row";
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        fn: increment,
        constants: [0]
      });
      const row = model.row({ rowName });
      t.same(row, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      t.end();
    });

    test("Add sequence row using custom initial constant", t => {
      const rowName = "test row";
      const initialValue = 500;
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        fn: increment,
        constants: [initialValue]
      });
      const row = model.row({ rowName });
      t.same(row, [500, 501, 502, 503, 504, 505, 506, 507, 508, 509]);
      t.end();
    });

    test("Add sequence row using multiple constants", t => {
      const rowName = "test row";
      const model = new Type(testDefaults);
      const constants = new Array(5);
      constants[0] = 3;
      constants[2] = 13;
      constants[4] = 113;
      constants[6] = 0;
      model.addRow({
        rowName,
        fn: increment,
        constants
      });
      const row = model.row({ rowName });
      t.same(row, [3, 4, 13, 14, 113, 114, 0, 1, 2, 3]);
      t.end();
    });

    test("Add sequence row using multiple constants via Map", t => {
      const rowName = "test row";
      const model = new Type(testDefaults);
      const constants = new Map([
        [0, 3],
        [2, 13],
        [4, 113],
        [6, 0]
      ]);
      model.addRow({
        rowName,
        fn: increment,
        constants
      });
      const row = model.row({ rowName });
      t.same(row, [3, 4, 13, 14, 113, 114, 0, 1, 2, 3]);
      t.end();
    });

    test("Add row of functions", t => {
      const rowName = "test row";
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        fn: interval
      });
      const row = model.row({ rowName });
      t.same(row, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      t.end();
    });

    test("Add partial row of functions", t => {
      const rowName = "test row";
      const start = 5;
      const end = 7;
      const fn = interval;
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        fn,
        start,
        end
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 0, 0, 5, 6, 7, 0, 0]);
      t.end();
    });

    test("Add multiple rows", t => {
      const numRows = 3;
      const model = new Type(testDefaults);
      const rowNames = ["row 0", "row 1", "row2"];
      rowNames.forEach(rowName => {
        model.addRow({
          rowName,
          fn: increment,
          constants: [0]
        });
      });
      rowNames.forEach(rowName => {
        const row = model.row({ rowName });
        t.same(row, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      });
      t.end();
    });
    typeTests.end();
  });
});
