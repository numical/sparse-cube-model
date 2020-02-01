const tap = require("tap");
const Model = require("../model/Model");
const MappedModel = require("../mappedModel/MappedModel");
const InteractiveModel = require("../interactiveModel/InteractiveModel");
const PersonalFinanceModel = require("../personalFinanceModel/PersonalFinanceModel");
const testFixtures = require("./testFixtures");

const allTypes = [Model, MappedModel, InteractiveModel, PersonalFinanceModel];

const testMeta = {
  intervals: {
    count: 9
  }
};

const emptyScenarios = (fn, Types = allTypes) => {
  Types.forEach(Type => {
    tap.test(`${Type.name} tests:`, typeTests => {
      const { test } = typeTests;
      const setupFn = (meta = testMeta) => {
        test.meta = meta; // yuk, impure
        return new Type(meta);
      };
      fn(test, setupFn, { Type });
      typeTests.end();
    });
  });
};

const typeFixtures = Object.entries(testFixtures).reduce(
  (typeFixtures, [name, testFixture]) => {
    const { setUp, ...rest } = testFixture;
    typeFixtures.push({
      name: `${name} : tests`,
      setUp: Type => setUp(Type),
      ...rest
    });
    typeFixtures.push({
      name: `${name} after serialisation : tests`,
      setUp: Type => Type.parse(setUp(Type).stringify()),
      ...rest
    });
    return typeFixtures;
  },
  []
);

const populatedScenarios = (fn, Types = allTypes) => {
  typeFixtures.forEach(({ name, setUp, ...rest }) => {
    Types.forEach(Type => {
      const description = `${Type.name} : ${name}`;
      tap.test(description, typeTests => {
        const { test } = typeTests;
        const fixture = { Type, ...rest };
        fn(test, setUp.bind(null, Type), fixture);
        typeTests.end();
      });
    });
  });
};

module.exports = { emptyScenarios, populatedScenarios };
