const { emptyScenarios } = require("../../test/testScaffold");
const { increment } = require("../../../fns/lookupFunctions");

emptyScenarios((test, setupFn) => {
  test("Add partial row of constants via object with too few values", t => {
    const rowKey = "test row";
    const start = 5;
    const constants = { 8: 8, 9: 9 };
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

  test("Add partial row of constants via object with too small value", t => {
    const rowKey = "test row";
    const start = 7;
    const constants = { 3: 3, 8: 8, 9: 9 };
    const model = setupFn();
    t.throws(
      () =>
        model.addRow({
          rowKey,
          constants,
          start
        }),
      new Error("Constant index 3 must be 7 or more.")
    );
    t.end();
  });

  test("Add partial row of constants via object with too large value", t => {
    const rowKey = "test row";
    const start = 3;
    const end = 5;
    const constants = { 3: 3, 4: 4, 9: 9 };
    const model = setupFn();
    t.throws(
      () =>
        model.addRow({
          rowKey,
          constants,
          start,
          end
        }),
      new Error("Constant index 9 must be 5 or less.")
    );
    t.end();
  });

  test("Add partial row of constants via object with start, no fn", t => {
    const rowKey = "test row";
    const start = 7;
    const constants = { 7: 70, 8: 80, 9: 90 };
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      start
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 0, 0, 0, 0, 0, 0, 70, 80, 90]);
    t.end();
  });

  test("Add partial row of constants via object with end, no fn", t => {
    const rowKey = "test row";
    const end = 3;
    const constants = { 0: 0, 1: 1, 2: 2, 3: 3 };
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      end
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 1, 2, 3, 0, 0, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of constants via object with start and end, no fn", t => {
    const rowKey = "test row";
    const start = 3;
    const end = 6;
    const constants = { 3: 30, 4: 40, 5: 50, 6: 60 };
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      start,
      end
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 0, 0, 30, 40, 50, 60, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of constants via object with start and fn", t => {
    const rowKey = "test row";
    const start = 4;
    const constants = { 7: 70, 8: 80 };
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      start,
      fn: increment
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 0, 0, 0, 1, 2, 3, 70, 80, 81]);
    t.end();
  });

  test("Add partial row of constants via object with end and fn", t => {
    const rowKey = "test row";
    const end = 3;
    const constants = { 0: 100, 2: 200 };
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      end,
      fn: increment
    });
    const row = model.row({ rowKey });
    t.same(row, [100, 101, 200, 201, 0, 0, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of constants via object with start and end and fn", t => {
    const rowKey = "test row";
    const start = 3;
    const end = 6;
    const constants = { 4: 40, 6: 60 };
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      start,
      end,
      fn: increment
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 0, 0, 1, 40, 41, 60, 0, 0, 0]);
    t.end();
  });
});
