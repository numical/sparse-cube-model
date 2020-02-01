const Model = require("../model/Model");
const {
  increment,
  lookup,
  lookupPrevious
} = require("../../fns/lookupFunctions");
const { identity } = require("../../fns/shadowFunctions");

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

const common = {
  meta,
  rows,
  rowKeys: rows.map(row => row.rowKey)
};

const withRows = {
  ...common,
  setUp: (constructorFn = Model) => {
    const model = new constructorFn(meta);
    rows.forEach(row => {
      model.addRow(row);
    });
    return model;
  },
  expectedLengths: (x = 0, y = 0, z = 0) => ({
    x: 10 + x,
    y: 4 + y,
    z: 1 + z
  }),
  hasMultipleScenarios: false,
  hasShadowScenario: false
};

const withScenarios = {
  ...common,
  setUp: (constructorFn = Model) => {
    const model = new constructorFn(meta);
    rows.forEach(row => {
      model.addRow(row);
    });
    model.addScenario({
      scenarioKey: "fixture scenario"
    });
    model.addScenario({
      scenarioKey: "fixture shadow scenario",
      shadow: { fn: identity }
    });
    return model;
  },
  expectedLengths: (x = 0, y = 0, z = 0) => ({
    x: 10 + x,
    y: 4 + y,
    z: 3 + z
  }),
  hasMultipleScenarios: true,
  hasShadowScenario: true
};

module.exports = {
  withRows,
  withScenarios
};
