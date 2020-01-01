const tap = require("tap");
const Model = require("../model/Model");
const MappedModel = require("../mappedModel/MappedModel");
const InteractiveModel = require("../interactiveModel/InteractiveModel");
const testFixture = require("./testFixture");

const testMeta = {
  intervals: {
    count: 10
  }
};

const setupDescriptions = [":", "after serialisation:"];

const setupFns = [
  Type => testFixture(Type),
  Type => Type.parse(testFixture(Type).stringify())
];

const emptyScenarios = fn => {
  [Model, MappedModel, InteractiveModel].forEach(Type => {
    tap.test(`${Type.name} tests:`, typeTests => {
      const { test } = typeTests;
      const setupFn = (meta = testMeta) => {
        test.meta = meta; // yuk, impure
        return new Type(meta);
      };
      fn(test, setupFn);
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
          test.meta = testFixture.meta;
          fn(test, setupFn.bind(null, Type));
          typeTests.end();
        }
      );
    });
  });
};

module.exports = { emptyScenarios, populatedScenarios };
