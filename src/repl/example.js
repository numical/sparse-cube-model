const asTable = require("as-table");
const Model = require("../model/Model");
const MappedModel = require("../model/MappedModel");
const { lookup, previous } = require("../fns/coreFunctions");

const model = new MappedModel({
  intervals: {
    count: 12
  }
});

model.addRow({
  rowName: "income",
  fn: previous,
  constants: [2000]
});

model.addRow({
  rowName: "lookup income",
  fn: lookup,
  fnArgs: { reference: "income" }
});

model.addRow({
  rowName: "temporary income",
  start: 4,
  end: 6,
  constants: [300, 400, 500]
});

// console.log(model.stringify({ pretty: true }));
console.log(asTable(model.scenario()));
console.log(model.row({ rowName: "temporary income" }));
