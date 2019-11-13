const { test, only } = require("tap");
const Model = require("./Model");
const increment = require("../fns/increment");

const intervalCount = 10;
const rowName = "test row";

const setUp = () => {
  const model = new Model({
    interval: {
      count: intervalCount
    }
  });
  model.addRow({
    rowName,
    fn: increment,
    constants: [0]
  });
  return model;
};

test("Update unknown row throws error", t => {
  const model = setUp();
  t.throws(() =>
    model.updateRow({
      rowName: "unknown row"
    })
  );
  t.end();
});

test("Update row in unknown scenario throws error", t => {
  const model = setUp();
  t.throws(() =>
    model.updateRow({
      rowName,
      scenarioName: "unknown scenario"
    })
  );
  t.end();
});

test("Update row with neither function nor constants throws error", t => {
  const model = setUp();
  t.throws(() =>
    model.updateRow({
      rowName
    })
  );
  t.end();
});

test("Update row updates all with constants", t => {
  const constants = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
  const expected = constants;
  const model = setUp();
  model.updateRow({ rowName, constants });
  t.same(model.row({ rowName }), expected);
  t.end();
});

test("Update row updates some with constants", t => {
  const constants = [0, 2, 4, undefined, undefined, undefined, 12, 14, 16, 18];
  const expected = [0, 2, 4, 5, 6, 7, 12, 14, 16, 18];
  const model = setUp();
  model.updateRow({ rowName, constants });
  t.same(model.row({ rowName }), expected);
  t.end();
});

test("Update row updates all with function", t => {
  const expected = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
  const model = setUp();
  const fn = () => x => 2 * x;
  model.updateRow({ rowName, fn });
  t.same(model.row({ rowName }), expected);
  t.end();
});
