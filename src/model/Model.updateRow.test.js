const { test, only } = require("tap");
const testFixture = require("./testFixture");

const rowName = "increment row";

test("Update unknown row throws error", t => {
  const { model } = testFixture();
  t.throws(
    () =>
      model.updateRow({
        rowName: "unknown row"
      }),
    new Error("Unknown row 'unknown row' for 'defaultScenario'")
  );
  t.end();
});

test("Update row in unknown scenario throws error", t => {
  const { model } = testFixture();
  t.throws(
    () =>
      model.updateRow({
        rowName,
        scenarioName: "unknown scenario"
      }),
    new Error("Unknown scenario 'unknown scenario'")
  );
  t.end();
});

test("Update row with neither function nor constants throws error", t => {
  const { model } = testFixture();
  t.throws(
    () =>
      model.updateRow({
        rowName
      }),
    new Error("No function or constants passed to update row.")
  );
  t.end();
});

test("Update row with a function with no key throws an error", t => {
  const { model } = testFixture();
  t.throws(
    () =>
      model.updateRow({
        rowName,
        fn: () => 2
      }),
    new Error("function 'fn' must have a 'key' property.")
  );
  t.end();
});

test("Update row updates all with constants", t => {
  const constants = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
  const expected = constants;
  const { model } = testFixture();
  model.updateRow({ rowName, constants });
  t.same(model.row({ rowName }), expected);
  t.end();
});

test("Update row updates some with constants", t => {
  const constants = [0, 2, 4, undefined, undefined, undefined, 12, 14, 16, 18];
  const expected = [0, 2, 4, 5, 6, 7, 12, 14, 16, 18];
  const { model } = testFixture();
  model.updateRow({ rowName, constants });
  t.same(model.row({ rowName }), expected);
  t.end();
});

test("Update row updates all with function", t => {
  const expected = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
  const { model } = testFixture();
  const fn = (_, x) => 2 * x;
  fn.key = "test fn";
  model.updateRow({ rowName, fn });
  t.same(model.row({ rowName }), expected);
  t.end();
});
