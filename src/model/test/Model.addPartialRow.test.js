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
    test("Add partial row of functions, no end", t => {
      const rowName = "test row";
      const start = 5;
      const fn = interval;
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        fn,
        start
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 0, 0, 5, 6, 7, 8, 9]);
      t.end();
    });

    test("Add partial row of functions, no start", t => {
      const rowName = "test row";
      const end = 5;
      const fn = interval;
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        fn,
        end
      });
      const row = model.row({ rowName });
      t.same(row, [0, 1, 2, 3, 4, 5, 0, 0, 0, 0]);
      t.end();
    });

    test("Add partial row of functions with start and end", t => {
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

    test("Add partial row of constants with a start and end", t => {
      const rowName = "test row";
      const start = 5;
      const end = 7;
      const constants = [50, 60, 70];
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        start,
        end
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 0, 0, 50, 60, 70, 0, 0]);
      t.end();
    });

    test("Add partial row of constants with a start, no end, and insufficient constants", t => {
      const rowName = "test row";
      const start = 5;
      const constants = [50, 60, 70];
      const model = new Type(testDefaults);
      t.throws(
        () =>
          model.addRow({
            rowName,
            constants,
            start
          }),
        new Error("Row has no function, but less constants than intervals.")
      );
      t.end();
    });

    test("Add partial row of constants with a start, no end, and sufficient constants", t => {
      const rowName = "test row";
      const start = 5;
      const constants = [50, 60, 70, 80, 90];
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        start
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 0, 0, 50, 60, 70, 80, 90]);
      t.end();
    });

    test("Add partial row of constants with no start, an end, and insufficient constants", t => {
      const rowName = "test row";
      const end = 5;
      const constants = [0, 10, 20];
      const model = new Type(testDefaults);
      t.throws(
        () =>
          model.addRow({
            rowName,
            constants,
            end
          }),
        new Error("Row has no function, but less constants than intervals.")
      );
      t.end();
    });

    test("Add partial row of constants with no start, an end, and sufficient constants", t => {
      const rowName = "test row";
      const end = 5;
      const constants = [0, 10, 20, 30, 40, 50];
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        end
      });
      const row = model.row({ rowName });
      t.same(row, [0, 10, 20, 30, 40, 50, 0, 0, 0, 0]);
      t.end();
    });

    test("Add partial row of constants with start, fn and constants", t => {
      const rowName = "test row";
      const start = 5;
      const constants = [50, 60, 70];
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        start,
        fn: interval
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 0, 0, 50, 60, 70, 8, 9]);
      t.end();
    });

    test("Add partial row of constants with end, fn and constants", t => {
      const rowName = "test row";
      const end = 5;
      const constants = [0, 10, 20];
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        end,
        fn: interval
      });
      const row = model.row({ rowName });
      t.same(row, [0, 10, 20, 3, 4, 5, 0, 0, 0, 0]);
      t.end();
    });

    test("Add partial row of constants with start and end, fn and constants", t => {
      const rowName = "test row";
      const start = 3;
      const end = 7;
      const constants = [30, 40, 50];
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        start,
        end,
        fn: interval
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 30, 40, 50, 6, 7, 0, 0]);
      t.end();
    });

    test("Add partial row of constants via object with too few values", t => {
      const rowName = "test row";
      const start = 5;
      const constants = { 8: 8, 9: 9 };
      const model = new Type(testDefaults);
      t.throws(
        () =>
          model.addRow({
            rowName,
            constants,
            start
          }),
        new Error("Row has no function, but less constants than intervals.")
      );
      t.end();
    });

    test("Add partial row of constants via object with too small value", t => {
      const rowName = "test row";
      const start = 7;
      const constants = { 3: 3, 8: 8, 9: 9 };
      const model = new Type(testDefaults);
      t.throws(
        () =>
          model.addRow({
            rowName,
            constants,
            start
          }),
        new Error("Constant index 3 must be 7 or more.")
      );
      t.end();
    });

    test("Add partial row of constants via object with too large value", t => {
      const rowName = "test row";
      const start = 3;
      const end = 5;
      const constants = { 3: 3, 4: 4, 9: 9 };
      const model = new Type(testDefaults);
      t.throws(
        () =>
          model.addRow({
            rowName,
            constants,
            start,
            end
          }),
        new Error("Constant index 9 must be 5 or less.")
      );
      t.end();
    });

    test("Add partial row of constants via object with start, no fn", t => {
      const rowName = "test row";
      const start = 7;
      const constants = { 7: 70, 8: 80, 9: 90 };
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        start
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 0, 0, 0, 0, 70, 80, 90]);
      t.end();
    });

    test("Add partial row of constants via object with end, no fn", t => {
      const rowName = "test row";
      const end = 3;
      const constants = { 0: 0, 1: 1, 2: 2, 3: 3 };
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        end
      });
      const row = model.row({ rowName });
      t.same(row, [0, 1, 2, 3, 0, 0, 0, 0, 0, 0]);
      t.end();
    });

    test("Add partial row of constants via object with start and end, no fn", t => {
      const rowName = "test row";
      const start = 3;
      const end = 6;
      const constants = { 3: 30, 4: 40, 5: 50, 6: 60 };
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        start,
        end
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 30, 40, 50, 60, 0, 0, 0]);
      t.end();
    });

    test("Add partial row of constants via object with start and fn", t => {
      const rowName = "test row";
      const start = 4;
      const constants = { 7: 70, 8: 80 };
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        start,
        fn: increment
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 0, 1, 2, 3, 70, 80, 81]);
      t.end();
    });

    test("Add partial row of constants via object with end and fn", t => {
      const rowName = "test row";
      const end = 3;
      const constants = { 0: 100, 2: 200 };
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        end,
        fn: increment
      });
      const row = model.row({ rowName });
      t.same(row, [100, 101, 200, 201, 0, 0, 0, 0, 0, 0]);
      t.end();
    });

    test("Add partial row of constants via object with start and end and fn", t => {
      const rowName = "test row";
      const start = 3;
      const end = 6;
      const constants = { 4: 40, 6: 60 };
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        start,
        end,
        fn: increment
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 1, 40, 41, 60, 0, 0, 0]);
      t.end();
    });

    test("Add partial row of constants via Map with too few values", t => {
      const rowName = "test row";
      const start = 5;
      const constants = new Map([
        [8, 8],
        [9, 9]
      ]);
      const model = new Type(testDefaults);
      t.throws(
        () =>
          model.addRow({
            rowName,
            constants,
            start
          }),
        new Error("Row has no function, but less constants than intervals.")
      );
      t.end();
    });

    test("Add partial row of constants via Map with too small value", t => {
      const rowName = "test row";
      const start = 7;
      const constants = new Map([
        [3, 3],
        [8, 8],
        [9, 9]
      ]);
      const model = new Type(testDefaults);
      t.throws(
        () =>
          model.addRow({
            rowName,
            constants,
            start
          }),
        new Error("Constant index 3 must be 7 or more.")
      );
      t.end();
    });

    test("Add partial row of constants via Map with too large value", t => {
      const rowName = "test row";
      const start = 3;
      const end = 5;
      const constants = new Map([
        [3, 3],
        [4, 4],
        [9, 9]
      ]);
      const model = new Type(testDefaults);
      t.throws(
        () =>
          model.addRow({
            rowName,
            constants,
            start,
            end
          }),
        new Error("Constant index 9 must be 5 or less.")
      );
      t.end();
    });

    test("Add partial row of constants via Map with start, no fn", t => {
      const rowName = "test row";
      const start = 7;
      const constants = new Map([
        [7, 70],
        [8, 80],
        [9, 90]
      ]);
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        start
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 0, 0, 0, 0, 70, 80, 90]);
      t.end();
    });

    test("Add partial row of constants via Map with end, no fn", t => {
      const rowName = "test row";
      const end = 3;
      const constants = new Map([
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3]
      ]);
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        end
      });
      const row = model.row({ rowName });
      t.same(row, [0, 1, 2, 3, 0, 0, 0, 0, 0, 0]);
      t.end();
    });

    test("Add partial row of constants via Map with start and end, no fn", t => {
      const rowName = "test row";
      const start = 3;
      const end = 6;
      const constants = new Map([
        [3, 30],
        [4, 40],
        [5, 50],
        [6, 60]
      ]);
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        start,
        end
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 30, 40, 50, 60, 0, 0, 0]);
      t.end();
    });

    test("Add partial row of constants via Map with start and fn", t => {
      const rowName = "test row";
      const start = 4;
      const constants = new Map([
        [7, 70],
        [8, 80]
      ]);
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        start,
        fn: increment
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 0, 1, 2, 3, 70, 80, 81]);
      t.end();
    });

    test("Add partial row of constants via Map with end and fn", t => {
      const rowName = "test row";
      const end = 3;
      const constants = new Map([
        [0, 100],
        [2, 200]
      ]);
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        end,
        fn: increment
      });
      const row = model.row({ rowName });
      t.same(row, [100, 101, 200, 201, 0, 0, 0, 0, 0, 0]);
      t.end();
    });

    test("Add partial row of constants via Map with start and end and fn", t => {
      const rowName = "test row";
      const start = 3;
      const end = 6;
      const constants = new Map([
        [4, 40],
        [6, 60]
      ]);
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        constants,
        start,
        end,
        fn: increment
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 1, 40, 41, 60, 0, 0, 0]);
      t.end();
    });

    typeTests.end();
  });
});
