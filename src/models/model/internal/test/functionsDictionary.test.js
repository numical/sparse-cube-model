const { test } = require("tap");
const fnsDictionary = require("../functionsDictionary");
const coreFunctions = require("../../../../fns/lookupFunctions");

test("model function singleton has all core functions", t => {
  Object.values(coreFunctions).forEach(coreFn => {
    const addedFn = fnsDictionary[coreFn.key];
    t.ok(addedFn);
    t.same(addedFn, coreFn);
  });
  t.end();
});

test("add fails if no arg", t => {
  t.throws(() => fnsDictionary.add(), new Error("Function required."));
  t.end();
});

test("add fails if arg not a function", t => {
  t.throws(
    () => fnsDictionary.add("a string"),
    new Error("'a string' is not a function.")
  );
  t.end();
});

test("add fails if function has no key property", t => {
  const fn = () => "";
  t.throws(
    () => fnsDictionary.add(fn),
    new Error("Function 'fn' requires a unique 'key' property.")
  );
  t.end();
});

test("add creates property on object", t => {
  const fn = () => "";
  fn.key = "test 1";
  fnsDictionary.add(fn);
  t.ok(fnsDictionary["test 1"]);
  t.same(fnsDictionary["test 1"], fn);
  t.end();
});

test("add fails if function key property is not unique", t => {
  const fn = () => "";
  fn.key = "test 2";
  fnsDictionary.add(fn);
  t.throws(
    () => fnsDictionary.add(fn),
    new Error("Function key 'test 2' already exists.")
  );
  t.end();
});
