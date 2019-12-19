/*
 Note: uses internal knowledge of Model serialization and metadata structure.
 */

const asTable = require("as-table");

const tablePrint = (model, printFn = console.log) => {
  const meta = JSON.parse(model.stringify());
  const rowNames = Object.keys(meta.scenarios.defaultScenario.rows);
  const maxRowNameLength = rowNames.reduce(
    (max, rowName) => (rowName.length > max ? rowName.length : max),
    0
  );
  const fixedLengthRowNames = rowNames.map(rowName =>
    rowName.padStart(maxRowNameLength, " ")
  );

  const s = asTable
    .configure({
      right: true,
      print: n =>
        typeof n === "number" ? Number.parseFloat(n).toFixed(2) : String(n)
    })(model.scenario())
    .split("\n")
    .map((row, index) => `${fixedLengthRowNames[index]}: ${row}`)
    .join("\n");

  printFn(s);
};

module.exports = tablePrint;