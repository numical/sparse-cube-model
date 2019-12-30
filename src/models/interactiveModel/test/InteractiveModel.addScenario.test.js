const { test } = require("tap");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const testFixture = require("../../test/testFixture");

test("add scenario to empty model can be undone", t => {
  const model = new InteractiveModel();
  const scenarioName = "test scenario";
  const pre = comparableUnserialisedForm({ model });
  model.addScenario({ scenarioName });
  t.same(model.lengths, { x: 0, y: 0, z: 0 });
  model.undo();
  t.same(model.lengths, { x: 0, y: 0, z: 0 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("add scenario to empty model can be redone", t => {
  const model = new InteractiveModel();
  const scenarioName = "test scenario";
  model.addScenario({ scenarioName });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("add scenario to populated model can be undone", t => {
  const model = testFixture(InteractiveModel);
  const scenarioName = "test scenario";
  const pre = comparableUnserialisedForm({ model });
  model.addScenario({ scenarioName });
  t.same(model.lengths, { x: 10, y: 4, z: 2 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("add scenario to populated model can be redone", t => {
  const model = testFixture(InteractiveModel);
  const scenarioName = "test scenario";
  model.addScenario({ scenarioName });
  const pre = comparableUnserialisedForm({ model });
  const preData = model.scenario({ scenarioName });
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 10, y: 4, z: 2 });
  const post = comparableUnserialisedForm({ model });
  const postData = model.scenario({ scenarioName });
  t.same(post, pre);
  t.same(postData, preData);
  t.end();
});
