const Model = require("../Model");
const { increment, lookup } = require("../../fns/coreFunctions");

const rows = [
  {
    rowName: "increment row",
    fn: increment,
    constants: [0]
  },
  {
    rowName: "first lookup row",
    fn: lookup,
    fnArgs: { reference: "increment row" },
    dependsOn: ["increment row"]
  },
  {
    rowName: "independent row",
    fn: increment,
    constants: [10]
  },
  {
    rowName: "second lookup row",
    fn: lookup,
    fnArgs: { reference: "increment row" },
    dependsOn: ["increment row"]
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
