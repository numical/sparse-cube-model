const { test } = require("tap");
const {
  intervalsPerYear,
  lookup,
  lookupPrevious
} = require("../lookupFunctions");

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

test("lookup reports no 'lookup' dependsOn'", t => {
  const args = {
    scenario: {
      rows: {}
    }
  };
  t.throws(() => lookup(args), new Error("Missing 'lookup' dependsOn arg."));
  t.end();
});

test("lookup reports unknown row", t => {
  const args = {
    scenario: {
      rows: {}
    },
    dependsOn: { lookup: "unknown row" }
  };
  t.throws(() => lookup(args), new Error("Unknown row 'unknown row'"));
  t.end();
});

test("lookupPrevious reports unknown row", t => {
  const args = {
    scenario: {
      rows: {}
    },
    dependsOn: { lookup: "another unknown row" }
  };
  t.throws(
    () => lookupPrevious(args),
    new Error("Unknown row 'another unknown row'")
  );
  t.end();
});
