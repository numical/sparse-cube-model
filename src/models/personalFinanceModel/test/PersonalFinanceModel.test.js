const { test } = require("tap");
const PersonalFinanceModel = require("../PersonalFinanceModel");

test("Can add savings account", t => {
  const model = new PersonalFinanceModel();
  model.addSavings();
  t.end();
});
