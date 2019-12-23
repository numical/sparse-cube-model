const Model = require("../model/Model");
const MappedModel = require("../model/MappedModel");
const { interval, previous } = require("../fns/lookupFunctions");
const {
  applyAnnualisedInterest,
  applyAnnualisedCompoundInterest
} = require("../fns/interestFunctions");
const tablePrint = require("./tablePrint");

const model = new Model({
  intervals: {
    count: 301
  }
});

model.addRow({
  rowName: "interval",
  fn: interval
});

model.addRow({
  rowName: "interest rate",
  fn: previous,
  constants: [3]
});

model.addRow({
  rowName: "contributions",
  fn: previous,
  constants: [300]
});

model.addRow({
  rowName: "total",
  fn: applyAnnualisedInterest,
  dependsOn: ["interest rate", "contributions"],
  constants: [10000]
});

model.addRow({
  rowName: "compound total",
  fn: applyAnnualisedCompoundInterest,
  dependsOn: ["interest rate", "contributions"],
  constants: [10000]
});

model.addRow({
  rowName: "separator",
  fn: previous,
  constants: [0]
});

model.addRow({
  rowName: "mortgage payments",
  fn: previous,
  constants: [-1000]
});

model.addRow({
  rowName: "mortgage balance",
  fn: applyAnnualisedCompoundInterest,
  dependsOn: ["interest rate", "mortgage payments"],
  constants: [250000]
});

tablePrint(model);

// console.log(model.stringify());
