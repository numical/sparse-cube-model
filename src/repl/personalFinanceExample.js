const PersonalFinanceModel = require("../models/personalFinanceModel/PersonalFinanceModel");
const tablePrint = require("./tablePrint");

const model = new PersonalFinanceModel();

model.addSavings({
  name: "Savings Account",
  startDate: new Date(2020, 5, 1),
  startAmount: 1000,
  interestRate: 2
});

console.log("Default:");
tablePrint(model);

model.setInflation(2);
console.log();
console.log("Inflation Adjusted:");
tablePrint(model, "defaultScenario_pfm.inflationAdjusted");
