const { test, only } = require("tap");
const modelFunctions = require("./modelFunctions");
const coreFunctions = require("../fns/coreFunctions");

test("model function singleton has all core functions", t => {
  Object.values(coreFunctions).forEach(coreFn => {
    const addedFn = modelFunctions[coreFn.key];
    t.ok(addedFn);
    t.same(addedFn, coreFn);
  });
  t.end();
});

test("add fails if no arg", t => {
  t.throws(() => modelFunctions.add(), new Error("Function required."));
  t.end();
});

test("add fails if arg not a function", t => {
  t.throws(
    () => modelFunctions.add("a string"),
    new Error("'a string' is not a function.")
  );
  t.end();
});

test("add fails if function has no key property", t => {
  const fn = () => "";
  t.throws(
    () => modelFunctions.add(fn),
    new Error("Function 'fn' requires a unique 'key' property.")
  );
  t.end();
});

test("add creates property on object", t => {
  const fn = () => "";
  fn.key = "test 1";
  modelFunctions.add(fn);
  t.ok(modelFunctions["test 1"]);
  t.same(modelFunctions["test 1"], fn);
  t.end();
});

test("add fails if function key property is nont unique", t => {
  const fn = () => "";
  fn.key = "test 2";
  modelFunctions.add(fn);
  t.throws(
    () => modelFunctions.add(fn),
    new Error("Function key 'test 2' already exists.")
  );
  t.end();
});
