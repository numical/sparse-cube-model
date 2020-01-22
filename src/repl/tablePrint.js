/*
 Note: uses internal knowledge of Model serialization and metadata structure.
 */

const asTable = require("as-table");
const MappedModel = require("../models/mappedModel/MappedModel");

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

const getMeta = model => {
  const serialized = model.stringify();
  const metaSerialized =
    model instanceof MappedModel ? serialized[0] : serialized;
  return JSON.parse(metaSerialized);
};

const tablePrint = (model, printFn = console.log) => {
  const meta = getMeta(model);
  const { intervals, scenarios } = meta;
  const rowKeys = Object.keys(scenarios.defaultScenario.rows);
  rowKeys.unshift("interval");
  const maxRowNameLength = rowKeys.reduce(
    (max, rowKey) => (rowKey.length > max ? rowKey.length : max),
    0
  );
  const fixedLengthRowNames = rowKeys.map(rowKey =>
    rowKey.padStart(maxRowNameLength, " ")
  );
  const rows = model.scenario({ includeDates: true });

  const s =
    rowKeys.length === 0
      ? "Empty Model."
      : asTable
          .configure(tableConfig)(rows)
          .split("\n")
          .map((row, index) => `${fixedLengthRowNames[index]}: ${row}`)
          .join("\n");

  printFn(s);
};

module.exports = tablePrint;
