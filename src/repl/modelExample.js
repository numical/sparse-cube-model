const Model = require("../models/model/Model");
const { interval, previous } = require("../fns/lookupFunctions");
const {
  applyAnnualisedInterest,
  applyAnnualisedCompoundInterest
} = require("../fns/interestFunctions");
const tablePrint = require("./tablePrint");

const model = new Model({
  intervals: {
    count: 300
  }
});

model.addRow({
  rowKey: "interval",
  fn: interval
});

model.addRow({
  rowKey: "interest rate",
  fn: previous,
  constants: [3]
});

model.addRow({
  rowKey: "contributions",
  fn: previous,
  constants: [300]
});

model.addRow({
  rowKey: "total",
  fn: applyAnnualisedInterest,
  dependsOn: { interest: "interest rate", increment: "contributions" },
  constants: [10000]
});

model.addRow({
  rowKey: "compound total",
  fn: applyAnnualisedCompoundInterest,
  dependsOn: { interest: "interest rate", increment: "contributions" },
  constants: [10000]
});

model.addRow({
  rowKey: "separator",
  fn: previous,
  constants: [0]
});

model.addRow({
  rowKey: "mortgage payments",
  fn: previous,
  constants: [-1000]
});

model.addRow({
  rowKey: "mortgage balance",
  fn: applyAnnualisedCompoundInterest,
  dependsOn: { interest: "interest rate", increment: "mortgage payments" },
  constants: [250000]
});

tablePrint(model);
