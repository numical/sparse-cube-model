const { test, only } = require("tap");
const Model = require("./Model");
const increment = require("../fns/increment");
const lookup = require("../fns/lookup");

const rows = [
  {
    rowName: "increment row",
    fn: increment,
    constants: [0]
  },
  {
    rowName: "first lookup row",
    fn: lookup("increment row"),
    dependsOn: ["increment row"]
  },
  {
    rowName: "independent row",
    fn: increment,
    constants: [10]
  },
  {
    rowName: "second lookup row",
    fn: lookup("increment row"),
    dependsOn: ["increment row"]
  }
];

const intervalCount = 10;

const setUp = () => {
  const model = new Model({
    interval: {
      count: intervalCount
    }
  });
  rows.forEach(row => {
    model.addRow(row);
  });
  return model;
};

test("Delete row with unknown scenario throws error", t => {
  const rowName = "test row";
  const scenarioName = "unknown test scenario";
  const model = setUp();
  t.throws(
    () => model.deleteRow({ rowName, scenarioName }),
    new Error("Unknown scenario 'unknown test scenario'")
  );
  t.end();
});

test("Delete row with unknown row name throws error", t => {
  const rowName = "test row";
  const model = setUp();
  t.throws(
    () => model.deleteRow({ rowName }),
    new Error("Unknown row 'test row' for 'defaultScenario'")
  );
  t.end();
});

test("Delete independent row", t => {
  const model = setUp();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const rowName = "independent row";
  model.deleteRow({
    rowName,
    scenarioName: "defaultScenario"
  });
  t.same(model.lengths, { x: 10, y: 3, z: 1 });
  t.throws(
    () => model.row({ rowName }),
    new Error(`Unknown row '${rowName}' for 'defaultScenario'`)
  );
  t.end();
});

test("Delete independent row, default scenario", t => {
  const model = setUp();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const rowName = "independent row";
  model.deleteRow({
    rowName
  });
  t.same(model.lengths, { x: 10, y: 3, z: 1 });
  t.throws(
    () => model.row({ rowName }),
    new Error(`Unknown row '${rowName}' for 'defaultScenario'`)
  );
  t.end();
});

test("Delete dependent row", t => {
  const model = setUp();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const rowName = "first lookup row";
  model.deleteRow({
    rowName,
    scenarioName: "defaultScenario"
  });
  t.same(model.lengths, { x: 10, y: 3, z: 1 });
  t.throws(
    () => model.row({ rowName }),
    new Error(`Unknown row '${rowName}' for 'defaultScenario'`)
  );
  t.end();
});

test("Delete row with dependencies fails", t => {
  const model = setUp();
  const rowName = "increment row";
  t.throws(
    () => model.deleteRow({ rowName }),
    new Error(
      "Cannot delete row 'increment row' as rows 'first lookup row, second lookup row' depend on it."
    )
  );
  t.end();
});

test("Delete multiple rows", t => {
  const model = setUp();
  const rowNames = ["first lookup row", "independent row"];
  model.deleteRows({ rowNames });
  t.same(model.lengths, { x: 10, y: 2, z: 1 });
  rowNames.forEach(rowName => {
    t.throws(
      () => model.row({ rowName }),
      new Error(`Unknown row '${rowName}' for 'defaultScenario'`)
    );
  });
  t.end();
});

test("Delete multiple linked rows", t => {
  const model = setUp();
  const rowNames = ["increment row", "first lookup row", "second lookup row"];
  model.deleteRows({ rowNames });
  t.same(model.lengths, { x: 10, y: 1, z: 1 });
  rowNames.forEach(rowName => {
    t.throws(
      () => model.row({ rowName }),
      new Error(`Unknown row '${rowName}' for 'defaultScenario'`)
    );
  });
  t.end();
});

test("Delete multiple linked rows errors if other rows also linked", t => {
  const model = setUp();
  const rowNames = ["increment row", "second lookup row"];
  t.throws(
    () => model.deleteRows({ rowNames }),
    new Error(
      "Cannot delete row 'increment row' as row 'first lookup row' depends on it."
    )
  );
  t.end();
});