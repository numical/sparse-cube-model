/*
 Note: uses internal knowledge of Model serialization and metadata structure.
 */

const asTable = require("as-table");
const MappedModel = require("../models/mappedModel/MappedModel");

const getMeta = model => {
  const serialized = model.stringify();
  const metaSerialized =
    model instanceof MappedModel ? serialized[0] : serialized;
  return JSON.parse(metaSerialized);
};

const tablePrint = (model, printFn = console.log) => {
  const meta = getMeta(model);
  const rowKeys = Object.keys(meta.scenarios.defaultScenario.rows);
  const maxRowNameLength = rowKeys.reduce(
    (max, rowKey) => (rowKey.length > max ? rowKey.length : max),
    0
  );
  const fixedLengthRowNames = rowKeys.map(rowKey =>
    rowKey.padStart(maxRowNameLength, " ")
  );

  const s =
    rowKeys.length === 0
      ? "Empty Model."
      : asTable
          .configure({
            right: true,
            print: n =>
              typeof n === "number"
                ? Number.parseFloat(n).toFixed(2)
                : String(n)
          })(model.scenario())
          .split("\n")
          .map((row, index) => `${fixedLengthRowNames[index]}: ${row}`)
          .join("\n");

  printFn(s);
};

module.exports = tablePrint;
