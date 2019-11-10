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
  t.throws(() =>
    model.updateRow({
      rowName: "unknown row"
    })
  );
  t.end();
});

test("Update row in unknown scenario throws error", t => {
  t.throws(() =>
    model.updateRow({
      rowName,
      scenarioName: "unknown scenario"
    })
  );
  t.end();
});
