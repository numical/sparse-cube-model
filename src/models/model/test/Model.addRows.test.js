const { emptyScenarios } = require("../../test/testScaffold");
const {
  increment,
  interval,
  previous
} = require("../../../fns/lookupFunctions");

const rows = [
  { rowName: "row 0", fn: interval },
  { rowName: "row 1", constants: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19] }
];

emptyScenarios((test, setupFn) => {
  test("Add rows with unknown scenario throws error", t => {
    const scenarioName = "unknown test scenario";
    const args = { rows, scenarioName };
    const model = setupFn();
    t.throws(
      () => model.addRows(args),
      new Error("Unknown scenario 'unknown test scenario'")
    );
    t.end();
  });

  test("Add rows with no rows throws error", t => {
    const args = {};
    const model = setupFn();
    t.throws(
      () => model.addRows(args),
      new Error("At least one row must be added.")
    );
    t.end();
  });

  test("Add rows with empty rows throws error", t => {
    const args = { rows: [] };
    const model = setupFn();
    t.throws(
      () => model.addRows(args),
      new Error("At least one row must be added.")
    );
    t.end();
  });

  test("Add rows with existing row name throws error", t => {
    const args = { rows };
    const model = setupFn();
    model.addRow({ rowName: "row 0", fn: interval });
    t.throws(
      () => model.addRows(args),
      new Error("Row 'row 0' already exists.")
    );
    t.end();
  });
});
