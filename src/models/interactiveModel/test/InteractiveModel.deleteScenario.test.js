const { test } = require("tap");
const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");

emptyScenarios(
  (test, setUp) => {
    test("delete scenario based on default scenario to empty model can be undone", t => {
      const model = setUp();
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

    test("delete scenario based on default scenario to empty model can be redone", t => {
      const model = setUp();
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

    test("delete scenario based on non-default scenario to empty model can be undone", t => {
      const model = setUp();
      const baseScenarioKey = "base scenario";
      const testScenarioKey = "test scenario";
      model.addScenario({
        scenarioKey: baseScenarioKey,
        historyDescription: "add base scenario"
      });
      model.addScenario({
        scenarioKey: testScenarioKey,
        historyDescription: "add test scenario",
        baseScenarioKey
      });
      const pre = comparableUnserialisedForm({ model });
      model.deleteScenario({ scenarioKey: testScenarioKey });
      model.undo();
      t.same(model.lengths, { x: 0, y: 0, z: 0 });
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("delete scenario based on non-default scenario to empty model can be redone", t => {
      const model = setUp();
      const baseScenarioKey = "base scenario";
      const testScenarioKey = "test scenario";
      model.addScenario({
        scenarioKey: baseScenarioKey,
        historyDescription: "add base scenario"
      });
      model.addScenario({
        scenarioKey: testScenarioKey,
        historyDescription: "add test scenario",
        baseScenarioKey
      });
      model.deleteScenario({ scenarioKey: testScenarioKey });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.lengths, { x: 0, y: 0, z: 0 });
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });
  },
  [InteractiveModel]
);

populatedScenarios(
  (test, setUp, fixture) => {
    test("delete scenario based on default scenario to populated model can be undone", t => {
      const model = setUp();
      const scenarioKey = "test scenario";
      model.addScenario({ scenarioKey });
      const pre = comparableUnserialisedForm({ model });
      const preData = model.scenario({ scenarioKey });
      model.deleteScenario({ scenarioKey });
      model.undo();
      t.same(model.lengths, fixture.expectedLengths(0, 0, 1));
      const postData = model.scenario({ scenarioKey });
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.same(postData, preData);
      t.end();
    });

    test("delete scenario based on default scenario to populated model can be redone", t => {
      const model = setUp();
      const scenarioKey = "test scenario";
      model.addScenario({ scenarioKey });
      model.deleteScenario({ scenarioKey });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.lengths, fixture.expectedLengths());
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("delete scenario based on non-default scenario to populated model can be undone", t => {
      const model = setUp();
      const baseScenarioKey = "base scenario";
      const testScenarioKey = "test scenario";
      model.addScenario({
        scenarioKey: baseScenarioKey,
        historyDescription: "add base scenario"
      });
      t.same(model.lengths, fixture.expectedLengths(0, 0, 1));
      model.addScenario({
        scenarioKey: testScenarioKey,
        historyDescription: "add test scenario",
        baseScenarioKey
      });
      t.same(model.lengths, fixture.expectedLengths(0, 0, 2));
      const pre = comparableUnserialisedForm({ model });
      model.deleteScenario({ scenarioKey: testScenarioKey });
      t.same(model.lengths, fixture.expectedLengths(0, 0, 1));
      model.undo();
      t.same(model.lengths, fixture.expectedLengths(0, 0, 2));
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("delete scenario based on non-default scenario to populated model can be redone", t => {
      const model = setUp();
      const baseScenarioKey = "base scenario";
      const testScenarioKey = "test scenario";
      model.addScenario({
        scenarioKey: baseScenarioKey,
        historyDescription: "add base scenario"
      });
      model.addScenario({
        scenarioKey: testScenarioKey,
        historyDescription: "add test scenario",
        baseScenarioKey
      });
      model.deleteScenario({ scenarioKey: testScenarioKey });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.lengths, fixture.expectedLengths(0, 0, 1));
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });
  },
  [InteractiveModel]
);
