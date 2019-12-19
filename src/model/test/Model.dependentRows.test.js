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

setupFns.forEach((setupFn, setupIndex) => {
  [Model, MappedModel].forEach(Type => {
    tap.test(
      `${Type.name} tests ${setupDescriptions[setupIndex]}`,
      typeTests => {
        const { test } = typeTests;
        test("Dependent rows have same values as their lookup", t => {
          const expected = [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
            [1000, 0, 1, 2, 3, 4, 5, 6, 7, 8]
          ];
          const model = setupFn(Type);
          testFixture.rowNames.forEach((rowName, index) => {
            t.same(model.row({ rowName }), expected[index]);
          });
          t.end();
        });

        test("Add row dependent on unknown row", t => {
          const model = setupFn(Type);
          const row = {
            rowName: "test row",
            fn: increment,
            constants: [0],
            dependsOn: "unknown row"
          };
          t.throws(() => model.addRow(row));
          t.end();
        });

        test("Update initial reference constants affects dependents", t => {
          const expected = [
            [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
            [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
            [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
            [1000, 10, 11, 12, 13, 14, 15, 16, 17, 18]
          ];
          const model = setupFn(Type);
          model.updateRow({
            rowName: "increment row",
            constants: [10],
            fn: increment
          });
          testFixture.rowNames.forEach((rowName, index) => {
            t.same(
              model.row({ rowName }),
              expected[index],
              `Row '${rowName}' does not match expected`
            );
          });
          t.end();
        });

        test("Update row dependsOn", t => {
          const expected = [1000, 11, 12, 13, 14, 15, 16, 17, 18, 19];
          const model = setupFn(Type);
          const rowName = "second lookup row";
          model.updateRow({
            rowName,
            fn: lookup,
            dependsOn: "independent row"
          });
          t.same(model.row({ rowName }), expected);
          t.end();
        });
        typeTests.end();
      }
    );
  });
});
