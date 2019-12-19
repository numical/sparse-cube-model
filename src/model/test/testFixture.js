const Model = require("../Model");
const {
  increment,
  lookup,
  lookupPrevious
} = require("../../fns/coreFunctions");

const rows = [
  {
    rowName: "increment row",
    fn: increment,
    constants: [0]
  },
  {
    rowName: "first lookup row",
    fn: lookup,
    dependsOn: "increment row"
  },
  {
    rowName: "independent row",
    fn: increment,
    constants: [10]
  },
  {
    rowName: "second lookup row",
    fn: lookupPrevious,
    constants: [1000],
    dependsOn: ["increment row"] // note: deliberate array
  }
];

const meta = {
  intervals: {
    count: 10
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
testFixture.rowNames = rows.map(row => row.rowName);
testFixture.meta = meta;

module.exports = testFixture;
