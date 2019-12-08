test("scenario returns scenario values", t => {
  const model = new Type({ intervals: { count: 3 } });
  const scenarioNames = ["scenario 1"];
  const rowNames = ["row 0", "row 1", "row 2"];
  const fn = ({ scenario, row }, index) =>
    `${scenario.name} : ${row.name} : index ${index}`;
  fn.key = "testfn";
  scenarioNames.forEach(scenarioName => {
    model.addScenario({ scenarioName });
    rowNames.forEach(rowName => {
      model.addRow({
        scenarioName,
        rowName,
        fn
      });
    });
  });

  const scenario1 = model.scenario({ scenarioName: "scenario 1" });
  t.same(scenario1, [
    [
      "scenario 1 : row 0 : index 0",
      "scenario 1 : row 0 : index 1",
      "scenario 1 : row 0 : index 2"
    ],
    [
      "scenario 1 : row 1 : index 0",
      "scenario 1 : row 1 : index 1",
      "scenario 1 : row 1 : index 2"
    ],
    [
      "scenario 1 : row 2 : index 0",
      "scenario 1 : row 2 : index 1",
      "scenario 1 : row 2 : index 2"
    ]
  ]);

  /*
  const scenario2 = model.scenario({ scenarioName: "scenario 2" });
  t.same(scenario2, [
    [
      "scenario 2 : row 0 : index 0",
      "scenario 2 : row 0 : index 1",
      "scenario 2 : row 0 : index 2"
    ],
    [
      "scenario 2 : row 1 : index 0",
      "scenario 2 : row 1 : index 1",
      "scenario 2 : row 1 : index 2"
    ],
    [
      "scenario 2 : row 2 : index 0",
      "scenario 2 : row 2 : index 1",
      "scenario 2 : row 2 : index 2"
    ]
  ]);

   */

  t.end();
});
