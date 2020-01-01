const { emptyScenarios } = require("../../test/testScaffold");
const { interval } = require("../../../fns/lookupFunctions");

const rowName = "test row";
const count = 12;
const testDefaults = {
  intervals: {
    count,
    epoch: 1577836800000, // 01/01/2020 00:00:00
    duration: "month"
  }
};

emptyScenarios((test, setupFn) => {
  test("Start date too early", t => {
    const start = new Date(2019, 11, 31);
    const model = setupFn(testDefaults);
    t.throws(
      () => model.addRow({ rowName, fn: interval, start }),
      new Error("'Tue Dec 31 2019' earlier than model start.")
    );
    t.end();
  });

  test("End date too late", t => {
    const end = new Date(2021, 0, 1);
    const model = setupFn(testDefaults);
    t.throws(
      () => model.addRow({ rowName, fn: interval, end }),
      new Error("'Fri Jan 01 2021' later than model end.")
    );
    t.end();
  });

  test("Add partial row of functions, date start", t => {
    const start = new Date(2020, 5, 1);
    const model = setupFn(testDefaults);
    model.addRow({
      rowName,
      fn: interval,
      start
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 0, 0, 5, 6, 7, 8, 9, 10, 11]);
    t.end();
  });

  test("Add partial row of functions, end date", t => {
    const end = new Date(2020, 5, 30);
    const model = setupFn(testDefaults);
    model.addRow({
      rowName,
      fn: interval,
      end
    });
    const row = model.row({ rowName });
    t.same(row, [0, 1, 2, 3, 4, 5, 0, 0, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of functions with start and end", t => {
    const start = new Date(2020, 5, 1);
    const end = new Date(2020, 7, 31);
    const model = setupFn(testDefaults);
    model.addRow({
      rowName,
      fn: interval,
      start,
      end
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 0, 0, 5, 6, 7, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of constants with a start and end", t => {
    const start = new Date(2020, 5, 1);
    const end = new Date(2020, 7, 31);
    const constants = [50, 60, 70];
    const model = setupFn(testDefaults);
    model.addRow({
      rowName,
      constants,
      start,
      end
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 0, 0, 50, 60, 70, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of date constants with a start and end", t => {
    const start = new Date(2020, 5, 1);
    const end = new Date(2020, 7, 31);
    const constants = new Map([
      [new Date(2020, 5, 15), 50],
      [new Date(2020, 6, 1), 60],
      [new Date(2020, 7, 30), 70]
    ]);
    const model = setupFn(testDefaults);
    model.addRow({
      rowName,
      constants,
      start,
      end
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 0, 0, 50, 60, 70, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of date constants wih multiple in same interval", t => {
    const start = new Date(2020, 5, 1);
    const end = new Date(2020, 7, 31);
    const constants = new Map([
      [new Date(2020, 5, 15), 50],
      [new Date(2020, 5, 1), 60],
      [new Date(2020, 7, 30), 70]
    ]);
    const model = setupFn(testDefaults);
    model.addRow({
      rowName,
      constants,
      fn: interval,
      start,
      end
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 0, 0, 110, 6, 70, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of date constants wih multiple in same interval resulting in too few", t => {
    const start = new Date(2020, 5, 1);
    const end = new Date(2020, 7, 31);
    const constants = new Map([
      [new Date(2020, 5, 15), 50],
      [new Date(2020, 5, 1), 60],
      [new Date(2020, 7, 30), 70]
    ]);
    const model = setupFn(testDefaults);
    t.throws(
      () =>
        model.addRow({
          rowName,
          constants,
          start,
          end
        }),
      new Error("Row has no function, but less constants than intervals.")
    );
    t.end();
  });
});
