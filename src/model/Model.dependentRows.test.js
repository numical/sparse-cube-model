const { test, only } = require("tap");
const testFixture = require("./testFixture");
const { increment } = require("../fns/coreFunctions");

test("Dependent rows have same values a their lookup", t => {
  const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const { model, rows } = testFixture();
  [0, 1, 3]
    .map(index => rows[index].rowName)
    .forEach(rowName => {
      t.same(model.row({ rowName }), expected);
    });
  t.end();
});

test("Add row dependent on unknown row", t => {
  const { model } = testFixture();
  const row = {
    rowName: "test row",
    fn: increment,
    constants: [0],
    dependsOn: ["unknown row"]
  };
  t.throws(() => model.addRow(row));
  t.end();
});

test("Update initial reference constants affects dependents", t => {
  const expected = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const { model, rows } = testFixture();
  model.updateRow({
    rowName: "increment row",
    constants: [10],
    fn: increment
  });
  [0, 1, 3]
    .map(index => rows[index].rowName)
    .forEach(rowName => {
      t.same(
        model.row({ rowName }),
        expected,
        `Row '${rowName}' does not match expected`
      );
    });
  t.end();
});
