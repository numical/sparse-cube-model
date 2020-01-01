const { emptyScenarios } = require("../../test/testScaffold");
const {
  increment,
  interval,
  previous
} = require("../../../fns/lookupFunctions");
const { applyInterest } = require("../../../fns/interestFunctions");

emptyScenarios((test, setupFn) => {
  test("Add row with complex function missing dependency throws error", t => {
    const model = setupFn();
    t.throws(
      () =>
        model.addRow({
          rowName: "test row",
          fn: applyInterest,
          constants: [1000]
        }),
      new Error("Missing 'interest' dependsOn value.")
    );
    t.end();
  });

  test("Add row with complex function with incorrect dependency throws error", t => {
    const model = setupFn();
    model.addRow({
      rowName: "interestRow",
      fn: previous,
      constants: [2]
    });
    t.throws(
      () =>
        model.addRow({
          rowName: "test row",
          fn: applyInterest,
          constants: [1000],
          dependsOn: {
            interest: "non-existent row"
          }
        }),
      new Error("Depends on unknown row 'non-existent row'")
    );
    t.end();
  });

  test("Add row with complex function works", t => {
    const model = setupFn({
      intervals: {
        count: 20
      }
    });
    model.addRow({
      rowName: "interestRow",
      fn: previous,
      constants: [2]
    });
    model.addRow({
      rowName: "testRow",
      fn: applyInterest,
      constants: [1000],
      dependsOn: {
        interest: "interestRow"
      }
    });
    t.same(model.lengths, { x: 20, y: 2, z: 1 });
    t.end();
  });
});
