const tap = require("tap");
const Model = require("../Model");
const MappedModel = require("../MappedModel");
const { increment, interval } = require("../../fns/coreFunctions");

const sequence = (length, mapFn = (_, i) => i) => Array.from({ length }, mapFn);

const count = 12;
const testDefaults = {
  intervals: {
    count,
    epoch: 1577836800000, // 01/01/2020 00:00:00
    duration: "month"
  }
};

[Model, MappedModel].forEach(Type => {
  tap.test(`${Type.name} tests: `, typeTests => {
    const { test, only } = typeTests;

    /*
    test("Add partial row of functions, date start", t => {
      const rowName = "test row";
      const start = new Date(2020, 5, 1);
      const model = new Type(testDefaults);
      model.addRow({
        rowName,
        fn: interval,
        start
      });
      const row = model.row({ rowName });
      t.same(row, [0, 0, 0, 0, 0, 5, 6, 7, 8, 9, 10, 11]);
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
    */

    typeTests.end();
  });
});
