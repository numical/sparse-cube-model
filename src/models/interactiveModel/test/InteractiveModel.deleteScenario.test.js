const { test } = require("tap");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const testFixture = require("../../test/testFixture");

test("delete scenario to empty model can be undone", t => {
  const model = new InteractiveModel();
  const scenarioKey = "test scenario";
  const historyDescription = "test operation";
  model.addScenario({ scenarioKey, historyDescription });
  const pre = comparableUnserialisedForm({ model });
  model.deleteScenario({ scenarioKey });
  model.undo();
  t.same(model.lengths, { x: 0, y: 0, z: 0 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("delete scenario to empty model can be redone", t => {
  const model = new InteractiveModel();
  const scenarioKey = "test scenario";
  model.addScenario({ scenarioKey });
  model.deleteScenario({ scenarioKey });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 0, y: 0, z: 0 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("add scenario to populated model can be undone", t => {
  const model = testFixture(InteractiveModel);
  const pre = comparableUnserialisedForm({ model });
  model.addScenario({ scenarioKey: "test scenario" });
  t.same(model.lengths, { x: 10, y: 4, z: 2 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("delete scenario to populated model can be undone", t => {
  const model = testFixture(InteractiveModel);
  const scenarioKey = "test scenario";
  model.addScenario({ scenarioKey });
  const pre = comparableUnserialisedForm({ model });
  const preData = model.scenario({ scenarioKey });
  model.deleteScenario({ scenarioKey });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 2 });
  const postData = model.scenario({ scenarioKey });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.same(postData, preData);
  t.end();
});

test("delete scenario to populated model can be redone", t => {
  const model = testFixture(InteractiveModel);
  const scenarioKey = "test scenario";
  model.addScenario({ scenarioKey });
  model.deleteScenario({ scenarioKey });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});
