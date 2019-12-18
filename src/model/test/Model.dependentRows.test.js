const tap = require("tap");
const Model = require("../Model");
const MappedModel = require("../MappedModel");
const testFixture = require("./testFixture");
const { increment, lookup } = require("../../fns/coreFunctions");

[Model, MappedModel].forEach(Type => {
  tap.test(`${Type.name} tests: `, typeTests => {
    const { test, only } = typeTests;
    test("Dependent rows have same values a their lookup", t => {
      const expected = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1000, 0, 1, 2, 3, 4, 5, 6, 7, 8]
      ];
      const { model, rows } = testFixture(Type);
      [0, 1, 3]
        .map(index => rows[index].rowName)
        .forEach((rowName, index) => {
          t.same(model.row({ rowName }), expected[index]);
        });
      t.end();
    });

    test("Add row dependent on unknown row", t => {
      const { model } = testFixture(Type);
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
        [1000, 10, 11, 12, 13, 14, 15, 16, 17, 18]
      ];
      const { model, rows } = testFixture(Type);
      model.updateRow({
        rowName: "increment row",
        constants: [10],
        fn: increment
      });
      [0, 1, 3]
        .map(index => rows[index].rowName)
        .forEach((rowName, index) => {
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
      const { model, rows } = testFixture(Type);
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
  });
});
