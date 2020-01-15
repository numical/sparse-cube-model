const validateRow = ({ rowKey, scenario, shouldExist = true }) => {
  if (!rowKey) {
    throw new Error("A row key is required.");
  }
  const row = scenario.rows[rowKey];
  if (shouldExist && !row) {
    throw new Error(`Unknown row '${rowKey}'.`);
  }
  if (!shouldExist && row) {
    throw new Error(`Row '${rowKey}' already exists.`);
  }
  return row;
};

module.exports = validateRow;
