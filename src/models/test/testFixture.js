const Model = require("../model/Model");
const {
  increment,
  lookup,
  lookupPrevious
} = require("../../fns/lookupFunctions");

const rows = [
  {
    rowKey: "increment row",
    fn: increment,
    constants: [0]
  },
  {
    rowKey: "first lookup row",
    fn: lookup,
    dependsOn: { lookup: "increment row" }
  },
  {
    rowKey: "independent row",
    fn: increment,
    constants: [10]
  },
  {
    rowKey: "second lookup row",
    fn: lookupPrevious,
    constants: [1000],
    dependsOn: { lookup: "increment row" }
  }
];

const meta = {
  intervals: {
    count: 9
  }
};

const testFixture = (constructorFn = Model) => {
  const model = new constructorFn(meta);
  rows.forEach(row => {
    model.addRow(row);
  });
  return model;
};

testFixture.rows = rows;
testFixture.rowKeys = rows.map(row => row.rowKey);
testFixture.meta = meta;

module.exports = testFixture;
