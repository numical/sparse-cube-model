const { populatedScenarios } = require("../../test/testScaffold");

populatedScenarios((test, setUp) => {
  test("Delete row with unknown scenario throws error", t => {
    const rowKey = "test row";
    const scenarioKey = "unknown test scenario";
    const model = setUp();
    t.throws(
      () => model.deleteRow({ rowKey, scenarioKey }),
      new Error("Unknown scenario 'unknown test scenario'")
    );
    t.end();
  });

  test("Delete row with unknown row key throws error", t => {
    const rowKey = "test row";
    const model = setUp();
    t.throws(
      () => model.deleteRow({ rowKey }),
      new Error("Unknown row 'test row'")
    );
    t.end();
  });

  test("Delete independent row", t => {
    const model = setUp();
    t.same(model.lengths, { x: 10, y: 4, z: 1 });
    const rowKey = "independent row";
    model.deleteRow({
      rowKey,
      scenarioKey: "defaultScenario"
    });
    t.same(model.lengths, { x: 10, y: 3, z: 1 });
    t.throws(() => model.row({ rowKey }), new Error(`Unknown row '${rowKey}'`));
    t.end();
  });

  test("Delete independent row, default scenario", t => {
    const model = setUp();
    t.same(model.lengths, { x: 10, y: 4, z: 1 });
    const rowKey = "independent row";
    model.deleteRow({
      rowKey
    });
    t.same(model.lengths, { x: 10, y: 3, z: 1 });
    t.throws(() => model.row({ rowKey }), new Error(`Unknown row '${rowKey}'`));
    t.end();
  });

  test("Delete dependent row", t => {
    const model = setUp();
    t.same(model.lengths, { x: 10, y: 4, z: 1 });
    const rowKey = "first lookup row";
    model.deleteRow({
      rowKey,
      scenarioKey: "defaultScenario"
    });
    t.same(model.lengths, { x: 10, y: 3, z: 1 });
    t.throws(() => model.row({ rowKey }), new Error(`Unknown row '${rowKey}'`));
    t.end();
  });

  test("Delete row with dependencies fails", t => {
    const model = setUp();
    const rowKey = "increment row";
    t.throws(
      () => model.deleteRow({ rowKey }),
      new Error(
        "Cannot delete row 'increment row' as rows 'first lookup row, second lookup row' depend on it."
      )
    );
    t.end();
  });

  test("Delete multiple rows", t => {
    const model = setUp();
    const rowKeys = ["first lookup row", "independent row"];
    model.deleteRows({ rowKeys });
    t.same(model.lengths, { x: 10, y: 2, z: 1 });
    rowKeys.forEach(rowKey => {
      t.throws(
        () => model.row({ rowKey }),
        new Error(`Unknown row '${rowKey}'`)
      );
    });
    t.end();
  });

  test("Delete multiple linked rows one at a time, latest first", t => {
    const model = setUp();
    const rowKeys = ["second lookup row", "first lookup row", "increment row"];
    rowKeys.forEach(rowKey => {
      model.deleteRow({ rowKey });
    });
    t.same(model.lengths, { x: 10, y: 1, z: 1 });
    rowKeys.forEach(rowKey => {
      t.throws(
        () => model.row({ rowKey }),
        new Error(`Unknown row '${rowKey}'`)
      );
    });
    t.end();
  });

  test("Delete multiple linked rows one at a time, earliest first", t => {
    const model = setUp();
    const rowKeys = ["first lookup row", "second lookup row", "increment row"];
    rowKeys.forEach(rowKey => {
      model.deleteRow({ rowKey });
    });
    t.same(model.lengths, { x: 10, y: 1, z: 1 });
    rowKeys.forEach(rowKey => {
      t.throws(
        () => model.row({ rowKey }),
        new Error(`Unknown row '${rowKey}'`)
      );
    });
    t.end();
  });

  test("Delete multiple linked rows in one go", t => {
    const model = setUp();
    const rowKeys = ["increment row", "first lookup row", "second lookup row"];
    model.deleteRows({ rowKeys });
    t.same(model.lengths, { x: 10, y: 1, z: 1 });
    rowKeys.forEach(rowKey => {
      t.throws(
        () => model.row({ rowKey }),
        new Error(`Unknown row '${rowKey}'`)
      );
    });
    t.end();
  });

  test("Delete multiple linked rows errors if other rows also linked", t => {
    const model = setUp();
    const rowKeys = ["increment row", "second lookup row"];
    t.throws(
      () => model.deleteRows({ rowKeys }),
      new Error(
        "Cannot delete row 'increment row' as row 'first lookup row' depends on it."
      )
    );
    t.end();
  });
});
