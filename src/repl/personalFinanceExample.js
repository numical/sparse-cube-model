const PersonalFinanceModel = require("../models/personalFinanceModel/PersonalFinanceModel");
const tablePrint = require("./tablePrint");

const model = new PersonalFinanceModel();
tablePrint(model);
