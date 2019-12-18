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

const intervals = {
  count: 10
};

module.exports = (constructorFn = Model) => {
  const model = new constructorFn({
    intervals
  });
  rows.forEach(row => {
    model.addRow(row);
  });
  return { intervals, rows, model };
};
