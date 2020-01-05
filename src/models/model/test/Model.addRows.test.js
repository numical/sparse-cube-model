const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");
const {
  interval,
  lookup,
  lookupPrevious
} = require("../../../fns/lookupFunctions");
const { applyInterest } = require("../../../fns/interestFunctions");

const rows = [
  { rowName: "row 0", fn: interval },
  { rowName: "row 1", constants: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19] },
  { rowName: "row 2", fn: lookup, dependsOn: "row 1" }
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

  test("Add rows with unknown dependency throws error", t => {
    const args = {
      rows: [
        {
          rowName: "test row",
          fn: lookup,
          dependsOn: "unknown row"
        }
      ]
    };
    const model = setupFn();
    t.throws(
      () => model.addRows(args),
      new Error("Depends on unknown row 'unknown row'")
    );
    t.end();
  });

  test("Add rows can add single, independent row", t => {
    const rowName = "test row";
    const args = { rows: [{ rowName, fn: interval }] };
    const model = setupFn();
    model.addRows(args);
    t.same(model.row({ rowName }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.end();
  });

  test("Add rows can add single, independent row, non-default scenario", t => {
    const rowName = "test row";
    const scenarioName = "test scenario";
    const args = { scenarioName, rows: [{ rowName, fn: interval }] };
    const model = setupFn();
    model.addScenario({ scenarioName });
    model.addRows(args);
    t.same(model.row({ scenarioName, rowName }), [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9
    ]);
    t.end();
  });

  test("Add rows can add two, independent rows", t => {
    const constants = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    const args = {
      rows: [
        { rowName: "test row 1", fn: interval },
        { rowName: "test row 2", constants }
      ]
    };
    const model = setupFn();
    model.addRows(args);
    t.same(model.row({ rowName: "test row 1" }), [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9
    ]);
    t.same(model.row({ rowName: "test row 2" }), constants);
    t.end();
  });

  test("Add rows can add multiple interdependent rows", t => {
    const constants = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const args = { rows };
    const model = setupFn();
    model.addRows(args);
    t.same(model.row({ rowName: "row 0" }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.same(model.row({ rowName: "row 1" }), constants);
    t.same(model.row({ rowName: "row 2" }), constants);
    t.end();
  });
});

populatedScenarios((test, setupFn) => {
  test("Add rows can add rows with dependencies on existing rows", t => {
    const args = {
      rows: [
        { rowName: "row 0", fn: lookup, dependsOn: "increment row" },
        {
          rowName: "row 1",
          fn: lookupPrevious,
          constants: [1000, 1001],
          dependsOn: "independent row"
        }
      ]
    };
    const model = setupFn();
    model.addRows(args);
    t.same(model.row({ rowName: "row 0" }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.same(model.row({ rowName: "row 1" }), [
      1000,
      1001,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18
    ]);
    t.end();
  });

  test("Add rows can add rows with mixed dependencies", t => {
    const args = {
      rows: [
        { rowName: "row 0", fn: lookup, dependsOn: "increment row" },
        {
          rowName: "row 1",
          fn: applyInterest,
          constants: [1000, 1000],
          dependsOn: {
            interest: "row 0",
            increment: "independent row"
          }
        }
      ]
    };
    const model = setupFn();
    model.addRows(args);
    t.same(model.row({ rowName: "row 0" }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.same(model.row({ rowName: "row 1" }), [
      1000,
      1000,
      1032.24,
      1076.5972,
      1134.221088,
      1206.6821424,
      1296.043070944,
      1404.95608591008,
      1536.7925727828865,
      1695.8139043333463
    ]);
    t.end();
  });
});
