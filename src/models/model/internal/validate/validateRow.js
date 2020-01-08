const validateRow = ({ rowName, scenario, shouldExist = true }) => {
  if (!rowName) {
    throw new Error("A row name is required.");
  }
  const row = scenario.rows[rowName];
  if (shouldExist && !row) {
    throw new Error(`Unknown row '${rowName}'.`);
  }
  if (!shouldExist && row) {
    throw new Error(`Row '${rowName}' already exists.`);
  }
  return row;
};

module.exports = validateRow;
