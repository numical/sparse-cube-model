/*
 Note: uses internal knowledge of Model serialization and metadata structure.
 */

const asTable = require("as-table");
const extractMetaData = require("./extractMetaData");

const printNumber = n => Number.parseFloat(n).toFixed(2);

const printDate = d => {
  const month = d.getMonth() + 1;
  const year = String(d.getFullYear()).substring(2);
  return `${month > 9 ? month : "0" + month}/${year}`;
};

const tableConfig = {
  right: true,
  print: n =>
    typeof n === "number"
      ? printNumber(n)
      : n instanceof Date
      ? printDate(n)
      : String(n)
};

const tablePrint = (model, scenarioKey, printFn = console.log) => {
  if (model.isEmpty()) {
    printFn("Empty Model.");
    return;
  }
  const { intervals, rowKeys, scenarios } = extractMetaData(model, scenarioKey);
  rowKeys.unshift("interval");
  const maxRowNameLength = rowKeys.reduce(
    (max, rowKey) => (rowKey.length > max ? rowKey.length : max),
    0
  );
  const fixedLengthRowNames = rowKeys.map(rowKey =>
    rowKey.padStart(maxRowNameLength, " ")
  );
  const rows = model.scenario({ includeDates: true });
  const s = asTable
    .configure(tableConfig)(rows)
    .split("\n")
    .map((row, index) => `${fixedLengthRowNames[index]}: ${row}`)
    .join("\n");
  printFn(s);
};

module.exports = tablePrint;
