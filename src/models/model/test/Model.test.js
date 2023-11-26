/*
 exercise the test scaffold options
 */

const { test } = require("tap");
const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");
const { withRows, withScenarios } = require("../../test/testFixtures");
const sequence = require("../../test/sequenceArray");
const { increment } = require("../../../fns/lookupFunctions");
const Model = require("../../model/Model");

const testFn = (setupFn, test) => t => {
  const model = setupFn();
  model.addRow({
    rowKey: "test row",
    fn: increment,
    constants: [0]
  });
  t.same(
    model.row({ rowKey: "test row" }),
    sequence(test.meta.intervals.count + 1)
  );
  t.end();
};

test("ensure withRows setup fn works", t => {
  const model = withRows.setUp(Model);
  t.type(model, Model);
  t.end();
});

test("ensure withRows setup fn works with default", t => {
  const model = withRows.setUp();
  t.type(model, Model);
  t.end();
});

test("ensure withScenarios setup fn works", t => {
  const model = withScenarios.setUp(Model);
  t.type(model, Model);
  t.end();
});

test("ensure withScenarios setup fn works with default", t => {
  const model = withScenarios.setUp();
  t.type(model, Model);
  t.end();
});

emptyScenarios((test, setupFn) => {
  test("Empty scenarios", testFn(setupFn, test));
});

emptyScenarios(
  (test, setupFn) => {
    test("Empty scenarios - selected types", testFn(setupFn, test));
  },
  [Model]
);

populatedScenarios((test, setupFn, fixture) => {
  test("Populated scenarios", testFn(setupFn, fixture));
});

populatedScenarios(
  (test, setupFn, fixture) => {
    test("Populated scenarios - selected type", testFn(setupFn, fixture));
  },
  [Model]
);

populatedScenarios(
  (test, setupFn, fixture) => {
    test(
      "Populated scenarios - selected type selected fixture",
      testFn(setupFn, fixture)
    );
  },
  [Model],
  withScenarios
);
