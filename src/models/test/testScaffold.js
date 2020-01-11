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

const emptyScenarios = (fn, Types = [Model, MappedModel, InteractiveModel]) => {
  Types.forEach(Type => {
    tap.test(`${Type.name} tests:`, typeTests => {
      const { test } = typeTests;
      const setupFn = (meta = testMeta) => {
        test.meta = meta; // yuk, impure
        return new Type(meta);
      };
      fn(test, setupFn, Type);
      typeTests.end();
    });
  });
};

const populatedScenarios = (
  fn,
  Types = [Model, MappedModel, InteractiveModel]
) => {
  setupFns.forEach((setupFn, setupIndex) => {
    Types.forEach(Type => {
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
