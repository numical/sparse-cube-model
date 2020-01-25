const createErrorMessage = (key, dependents) => {
  const { rows = [], scenarios = [] } = dependents;
  const all = [...rows, ...scenarios];
  return `Cannot delete row '${key}' as '${all.join(", ")}' depend${
    all.length > 1 ? "" : "s"
  } on it.`;
};

const validateCanDeleteRow = row => {
  const { dependents, key } = row;
  if (dependents) {
    throw new Error(createErrorMessage(key, dependents));
  }
};

module.exports = validateCanDeleteRow;
