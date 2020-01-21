const PersonalFinanceModel = require("../models/personalFinanceModel/PersonalFinanceModel");
const tablePrint = require("./tablePrint");

const model = new PersonalFinanceModel();
model.addSavings({
  name: "Savings Account",
  startDate: new Date(2020, 5, 1),
  startAmount: 1000,
  interestRate: 2
});
tablePrint(model);
