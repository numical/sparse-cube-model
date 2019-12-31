const testFixture = require("../../test/testFixture");
const { increment, lookup } = require("../../../fns/lookupFunctions");
const { applyInterest } = require("../../../fns/interestFunctions");
const { populatedScenarios } = require("../../test/testScaffold");

populatedScenarios((test, setUp) => {
  test("Dependent rows have same values as their lookup", t => {
    const expected = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      [1000, 0, 1, 2, 3, 4, 5, 6, 7, 8]
    ];
    const model = setUp();
    testFixture.rowNames.forEach((rowName, index) => {
      t.same(model.row({ rowName }), expected[index]);
    });
    t.end();
  });

  test("Add row dependent on unknown row", t => {
    const model = setUp();
    const row = {
      rowName: "test row",
      fn: increment,
      constants: [0],
      dependsOn: "unknown row"
    };
    t.throws(() => model.addRow(row));
    t.end();
  });

  test("Update initial reference constants affects dependents", t => {
    const expected = [
      [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      [1000, 10, 11, 12, 13, 14, 15, 16, 17, 18]
    ];
    const model = setUp();
    model.updateRow({
      rowName: "increment row",
      constants: [10],
      fn: increment
    });
    testFixture.rowNames.forEach((rowName, index) => {
      t.same(
        model.row({ rowName }),
        expected[index],
        `Row '${rowName}' does not match expected`
      );
    });
    t.end();
  });

  test("Update row dependsOn", t => {
    const expected = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const model = setUp();
    const rowName = "second lookup row";
    model.updateRow({
      rowName,
      fn: lookup,
      dependsOn: "independent row"
    });
    t.same(model.row({ rowName }), expected);
    t.end();
  });

  test("Update row with function with mandatory dependents", t => {
    const expected = [
      1000,
      1110,
      1243.2,
      1404.816,
      1601.49024,
      1841.713776,
      2136.38798016,
      2499.5739367872002,
      2949.4972454088963,
      3509.9017220365863
    ];
    const model = setUp();
    const rowName = "second lookup row";
    model.updateRow({
      rowName,
      fn: applyInterest,
      dependsOn: {
        interest: "independent row"
      },
      constants: [1000]
    });
    t.same(model.row({ rowName }), expected);
    t.end();
  });

  test("Reset row which had function with mandatory dependents", t => {
    const expected = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const model = setUp();
    const rowName = "second lookup row";
    model.updateRow({
      rowName,
      fn: applyInterest,
      dependsOn: {
        interest: "independent row"
      },
      constants: [123]
    });
    model.updateRow({
      rowName,
      fn: lookup,
      dependsOn: "independent row"
    });
    t.same(model.row({ rowName }), expected);
    t.end();
  });
});
