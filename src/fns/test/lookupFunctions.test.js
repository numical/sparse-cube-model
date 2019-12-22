const { test } = require("tap");
const { intervalsPerYear } = require("../lookupFunctions");

test("intervals per year - month", t => {
  t.same(intervalsPerYear({ intervals: { duration: "month" } }), 12);
  t.end();
});

test("intervals per year - year", t => {
  t.same(intervalsPerYear({ intervals: { duration: "year" } }), 1);
  t.end();
});

test("intervals per year - other", t => {
  t.throws(
    () => intervalsPerYear({ intervals: { duration: "other" } }),
    new Error("Unknown duration 'other'.")
  );
  t.end();
});
