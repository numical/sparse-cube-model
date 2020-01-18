const tap = require("tap");
const Model = require("../model/Model");
const MappedModel = require("../mappedModel/MappedModel");
const InteractiveModel = require("../interactiveModel/InteractiveModel");
const PersonalFinanceModel = require("../personalFinanceModel/PersonalFinanceModel");
const testFixture = require("./testFixture");

const allTypes = [Model, MappedModel, InteractiveModel, PersonalFinanceModel];

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

const emptyScenarios = (fn, Types = allTypes) => {
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

const populatedScenarios = (fn, Types = allTypes) => {
  setupFns.forEach((setupFn, setupIndex) => {
    Types.forEach(Type => {
      tap.test(
        `${Type.name} tests ${setupDescriptions[setupIndex]}`,
        typeTests => {
          const { test } = typeTests;
          test.meta = testFixture.meta;
          fn(test, setupFn.bind(null, Type), Type);
          typeTests.end();
        }
      );
    });
  });
};

module.exports = { emptyScenarios, populatedScenarios };
