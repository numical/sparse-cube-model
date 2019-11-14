const { test, only } = require("tap");
const Model = require("./Model");
const increment = require("../fns/increment");
const lookup = require("../fns/lookup");

const intervalCount = 10;

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
    rowName: "second lookup row",
    fn: lookup("increment row"),
    dependsOn: ["increment row"]
  }
];

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

test("Add 3 rows, second two dependent on first", t => {
  const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const model = setUp();
  rows.forEach(row => {
    t.same(model.row(row), expected);
  });
  t.end();
});

test("Add row dependent on unknown row", t => {
  const model = setUp();
  const row = {
    rowName: "test row",
    fn: increment,
    constants: [0],
    dependsOn: ["unknown row"]
  };
  t.throws(() => model.addRow(row));
  t.end();
});

test("Add 2 rows, update initial reference constant", t => {
  const expected = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const model = setUp();
  model.updateRow({
    rowName: "increment row",
    constants: [10]
  });
  rows.forEach(row => {
    t.same(
      model.row(row),
      expected,
      `Row '${row.rowName}' does not match expected`
    );
  });
  t.end();
});
