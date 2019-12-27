const tap = require("tap");
const Model = require("../Model");
const MappedModel = require("../MappedModel");
const InteractiveModel = require("../InteractiveModel");
const testFixture = require("./testFixture");

const setupDescriptions = [":", "after serialisation:"];

const setupFns = [
  Type => testFixture(Type),
  Type => Type.parse(testFixture(Type).stringify())
];

const emptyScenarios = fn => {
  [Model, MappedModel, InteractiveModel].forEach(Type => {
    tap.test(`${Type.name} tests:`, typeTests => {
      const { test } = typeTests;
      fn(test, Type);
      typeTests.end();
    });
  });
};

const populatedScenarios = fn => {
  setupFns.forEach((setupFn, setupIndex) => {
    [Model, MappedModel, InteractiveModel].forEach(Type => {
      tap.test(
        `${Type.name} tests ${setupDescriptions[setupIndex]}`,
        typeTests => {
          const { test } = typeTests;
          fn(test, setupFn.bind(null, Type));
          typeTests.end();
        }
      );
    });
  });
};

module.exports = { emptyScenarios, populatedScenarios };
