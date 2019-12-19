const tap = require("tap");
const Model = require("../Model");
const MappedModel = require("../MappedModel");
const testFixture = require("./testFixture");
const { increment, lookup } = require("../../fns/coreFunctions");

const setupDescriptions = [":", "after serialisation:"];
const setupFns = [
  Type => testFixture(Type),
  Type => Type.parse(testFixture(Type).stringify())
];

const multiTest = fn => {
  setupFns.forEach((setupFn, setupIndex) => {
    [Model, MappedModel].forEach(Type => {
      tap.test(
        `${Type.name} tests ${setupDescriptions[setupIndex]}`,
        typeTests => {
          const { test } = typeTests;
          const setUpModel = setupFn.bind(null, Type);
          fn(test, setUpModel);
          typeTests.end();
        }
      );
    });
  });
};

module.exports = multiTest;
