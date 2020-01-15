const { emptyScenarios } = require("../../test/testScaffold");
const { interval } = require("../../../fns/lookupFunctions");

emptyScenarios((test, setupFn) => {
  test("Add partial row of functions, no end", t => {
    const rowKey = "test row";
    const start = 5;
    const fn = interval;
    const model = setupFn();
    model.addRow({
      rowKey,
      fn,
      start
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 0, 0, 0, 0, 5, 6, 7, 8, 9]);
    t.end();
  });

  test("Add partial row of functions, no start", t => {
    const rowKey = "test row";
    const end = 5;
    const fn = interval;
    const model = setupFn();
    model.addRow({
      rowKey,
      fn,
      end
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 1, 2, 3, 4, 5, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of functions with start and end", t => {
    const rowKey = "test row";
    const start = 5;
    const end = 7;
    const fn = interval;
    const model = setupFn();
    model.addRow({
      rowKey,
      fn,
      start,
      end
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 0, 0, 0, 0, 5, 6, 7, 0, 0]);
    t.end();
  });

  test("Add partial row of constants with a start and end", t => {
    const rowKey = "test row";
    const start = 5;
    const end = 7;
    const constants = [50, 60, 70];
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      start,
      end
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 0, 0, 0, 0, 50, 60, 70, 0, 0]);
    t.end();
  });

  test("Add partial row of constants with a start, no end, and insufficient constants", t => {
    const rowKey = "test row";
    const start = 5;
    const constants = [50, 60, 70, 80];
    const model = setupFn();
    t.throws(
      () =>
        model.addRow({
          rowKey,
          constants,
          start
        }),
      new Error("Row has no function, but less constants than intervals.")
    );
    t.end();
  });

  test("Add partial row of constants with a start, no end, and sufficient constants", t => {
    const rowKey = "test row";
    const start = 5;
    const constants = [50, 60, 70, 80, 90];
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      start
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 0, 0, 0, 0, 50, 60, 70, 80, 90]);
    t.end();
  });

  test("Add partial row of constants with no start, an end, and insufficient constants", t => {
    const rowKey = "test row";
    const end = 5;
    const constants = [0, 10, 20];
    const model = setupFn();
    t.throws(
      () =>
        model.addRow({
          rowKey,
          constants,
          end
        }),
      new Error("Row has no function, but less constants than intervals.")
    );
    t.end();
  });

  test("Add partial row of constants with no start, an end, and sufficient constants", t => {
    const rowKey = "test row";
    const end = 5;
    const constants = [0, 10, 20, 30, 40, 50];
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      end
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 10, 20, 30, 40, 50, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of constants with start, fn and constants", t => {
    const rowKey = "test row";
    const start = 5;
    const constants = [50, 60, 70];
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      start,
      fn: interval
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 0, 0, 0, 0, 50, 60, 70, 8, 9]);
    t.end();
  });

  test("Add partial row of constants with end, fn and constants", t => {
    const rowKey = "test row";
    const end = 5;
    const constants = [0, 10, 20];
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      end,
      fn: interval
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 10, 20, 3, 4, 5, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of constants with start and end, fn and constants", t => {
    const rowKey = "test row";
    const start = 3;
    const end = 7;
    const constants = [30, 40, 50];
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      start,
      end,
      fn: interval
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 0, 0, 30, 40, 50, 6, 7, 0, 0]);
    t.end();
  });
});
