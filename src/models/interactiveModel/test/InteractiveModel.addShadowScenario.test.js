const { test } = require("tap");
const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const { identity } = require("../../../fns/shadowFunctions");

emptyScenarios(
  (test, setUp) => {
    test("add shadow scenario to empty model can be undone", t => {
      const model = setUp();
      const historyDescription = "test operation";
      const scenarioKey = "test scenario";
      const shadow = { fn: identity };
      const pre = comparableUnserialisedForm({ model });
      model.addScenario({ scenarioKey, shadow, historyDescription });
      t.same(model.lengths, { x: 0, y: 0, z: 0 });
      model.undo();
      t.same(model.lengths, { x: 0, y: 0, z: 0 });
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("add shadow scenario to empty model can be redone", t => {
      const model = setUp();
      const historyDescription = "test operation";
      const scenarioKey = "test scenario";
      const shadow = { fn: identity };
      model.addScenario({ scenarioKey, shadow, historyDescription });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });
  },
  [InteractiveModel]
);

populatedScenarios(
  (test, setUp, fixture) => {
    test("add shadow scenario to populated model can be undone", t => {
      const model = setUp();
      const historyDescription = "test operation";
      const scenarioKey = "test scenario";
      const shadow = { fn: identity };
      const pre = comparableUnserialisedForm({ model });
      model.addScenario({ scenarioKey, shadow, historyDescription });
      t.same(model.lengths, fixture.expectedLengths(0, 0, 1));
      model.undo();
      t.same(model.lengths, fixture.expectedLengths());
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("add shadow scenario to populated model can be redone", t => {
      const model = setUp();
      const historyDescription = "test operation";
      const scenarioKey = "test scenario";
      const shadow = { fn: identity };
      model.addScenario({ scenarioKey, shadow, historyDescription });
      const pre = comparableUnserialisedForm({ model });
      const preData = model.scenario({ scenarioKey });
      model.undo();
      model.redo();
      t.same(model.lengths, fixture.expectedLengths(0, 0, 1));
      const post = comparableUnserialisedForm({ model });
      const postData = model.scenario({ scenarioKey });
      t.same(post, pre);
      t.same(postData, preData);
      t.end();
    });
  },
  [InteractiveModel]
);
