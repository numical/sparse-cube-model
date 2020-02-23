const { test } = require("tap");
const PersonalFinanceModel = require("../PersonalFinanceModel");
const keys = require("../internal/keys");
const tablePrint = require("../../../repl/tablePrint");
const { zeroes } = require("./threeHundredAndOne");

test("Savings account must have a name", t => {
  const model = new PersonalFinanceModel();
  t.throws(() => model.addSavings(), new Error("Savings must have a name."));
  t.end();
});

test("Savings account must have a start date", t => {
  const model = new PersonalFinanceModel();
  const args = {
    name: "Savings Account"
  };
  t.throws(
    () => model.addSavings(args),
    new Error("Savings must have a start date.")
  );
  t.end();
});

test("Savings account start date must on or after model start", t => {
  const model = new PersonalFinanceModel();
  const args = {
    name: "Savings Account",
    startDate: new Date(2019, 0, 1)
  };
  t.throws(
    () => model.addSavings(args),
    new Error("'Tue Jan 01 2019' earlier than model start.")
  );
  t.end();
});

test("Savings account start date must before model end", t => {
  const model = new PersonalFinanceModel();
  const args = {
    name: "Savings Account",
    startDate: new Date(2050, 0, 1)
  };
  t.throws(
    () => model.addSavings(args),
    new Error("'Sat Jan 01 2050' later than model end.")
  );
  t.end();
});

test("Savings account can be set up with zero values", t => {
  const model = new PersonalFinanceModel();
  const args = {
    name: "Savings Account",
    startDate: new Date(2020, 0, 1)
  };
  model.addSavings(args);
  t.same(model.lengths, { x: 301, y: 3, z: 1 });
  t.same(model.row({ rowKey: `${keys.savings.row.interestRate}_0` }), zeroes);
  t.same(model.row({ rowKey: `${keys.savings.row.contribution}_0` }), zeroes);
  t.same(model.row({ rowKey: `${keys.savings.row.amount}_0` }), zeroes);
  t.end();
});

test("Cannot set up 2 savings accounts with the same name.", t => {
  const model = new PersonalFinanceModel();
  const args = {
    name: "Savings Account",
    startDate: new Date(2020, 0, 1)
  };
  model.addSavings(args);
  t.throws(
    () => model.addSavings(args),
    new Error(`Savings account 'Savings Account' already exists.`)
  );
  t.end();
});

test("Can set up multiple savings accounts with the different names.", t => {
  const model = new PersonalFinanceModel();
  model.addSavings({
    name: "Savings Account 1",
    startDate: new Date(2020, 0, 1)
  });
  model.addSavings({
    name: "Savings Account 2",
    startDate: new Date(2025, 5, 1)
  });
  t.same(model.lengths, { x: 301, y: 6, z: 1 });
  t.end();
});
