const { test } = require("tap");
const getDateFromInterval = require("../getDateFromInterval");

const epoch = new Date(2020, 0).getTime();

test("invalid duration", t => {
  const args = { epoch, duration: "wibble" };
  t.throws(
    () => getDateFromInterval(args)(0),
    new Error("Unknown interval duration 'wibble'.")
  );
  t.end();
});

test("single year duration", t => {
  const args = { epoch, duration: "year" };
  t.same(getDateFromInterval(args)(1), new Date(2021, 0));
  t.end();
});

test("single month duration", t => {
  const args = { epoch, duration: "month" };
  t.same(getDateFromInterval(args)(1), new Date(2020, 1));
  t.end();
});

test("twelve month duration", t => {
  const args = { epoch, duration: "month" };
  t.same(getDateFromInterval(args)(12), new Date(2021, 0));
  t.end();
});
