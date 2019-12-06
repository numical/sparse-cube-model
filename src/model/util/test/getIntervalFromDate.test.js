const { test } = require("tap");
const getIntervalFromDate = require("../getIntervalFromDate");
const { defaults } = require("../modelMetadata");

const epoch = new Date(2020, 0).getTime();
const count = 12;

test("invalid duration", t => {
  const args = { epoch, count, duration: "wibble" };
  const date = new Date(2019, 0);
  t.throws(
    () => getIntervalFromDate(args)(date),
    new Error("Unknown interval duration 'wibble'.")
  );
  t.end();
});

test("year duration, too early", t => {
  const args = { epoch, count, duration: "year" };
  const date = new Date(2019, 0);
  t.throws(
    () => getIntervalFromDate(args)(date),
    new Error("'Tue Jan 01 2019' earlier than model start.")
  );
  t.end();
});

test("year duration, too late", t => {
  const args = { epoch, count, duration: "year" };
  const date = new Date(2033, 0);
  t.throws(
    () => getIntervalFromDate(args)(date),
    new Error("'Sat Jan 01 2033' later than model end.")
  );
  t.end();
});

test("year duration, same year", t => {
  const args = { epoch, count, duration: "year" };
  const date = new Date(2020, 0);
  t.equal(0, getIntervalFromDate(args)(date));
  t.end();
});

test("year duration, end of year", t => {
  const args = { epoch, count, duration: "year" };
  const date = new Date(2020, 11, 31, 23, 59, 59, 999);
  t.equal(0, getIntervalFromDate(args)(date));
  t.end();
});

test("year duration, next year", t => {
  const args = { epoch, count, duration: "year" };
  const date = new Date(2021, 0, 1);
  t.equal(1, getIntervalFromDate(args)(date));
  t.end();
});

test("year duration, 10 years and a few months", t => {
  const args = { epoch, count, duration: "year" };
  const date = new Date(2030, 6, 31);
  t.equal(10, getIntervalFromDate(args)(date));
  t.end();
});

test("month duration, too early", t => {
  const args = { epoch, count, duration: "month" };
  const date = new Date(2019, 11, 31);
  t.throws(
    () => getIntervalFromDate(args)(date),
    new Error("'Tue Dec 31 2019' earlier than model start.")
  );
  t.end();
});

test("month duration, too late", t => {
  const args = { epoch, count, duration: "month" };
  const date = new Date(2021, 0);
  t.throws(
    () => getIntervalFromDate(args)(date),
    new Error("'Fri Jan 01 2021' later than model end.")
  );
  t.end();
});

test("month duration, same month", t => {
  const args = { epoch, count, duration: "month" };
  const date = new Date(2020, 0);
  t.equal(0, getIntervalFromDate(args)(date));
  t.end();
});

test("month duration, end of month", t => {
  const args = { epoch, count, duration: "month" };
  const date = new Date(2020, 0, 31, 23, 59, 59, 999);
  t.equal(0, getIntervalFromDate(args)(date));
  t.end();
});

test("month duration, next month", t => {
  const args = { epoch, count, duration: "month" };
  const date = new Date(2020, 1, 1);
  t.equal(1, getIntervalFromDate(args)(date));
  t.end();
});

test("month duration, 10 months", t => {
  const args = { epoch, count, duration: "month" };
  const date = new Date(2020, 10, 30);
  t.equal(10, getIntervalFromDate(args)(date));
  t.end();
});

test("different epoch, month duration, same month", t => {
  const epoch = new Date(1971, 11, 11).getTime();
  const args = { epoch, count, duration: "month" };
  const date = new Date(1971, 11, 31);
  t.equal(0, getIntervalFromDate(args)(date));
  t.end();
});

test("different epoch,many intervals, different dates", t => {
  const epoch = new Date(1971, 11, 1).getTime();
  const args = { epoch, count: 300, duration: "month" };
  const subject = getIntervalFromDate(args);
  const tests = {
    12: new Date(1972, 11, 11),
    240: new Date(1991, 11, 11),
    234: new Date(1991, 5, 30)
  };
  Object.entries(tests).forEach(([interval, date]) => {
    t.same(interval, subject(date));
  });
  t.end();
});
