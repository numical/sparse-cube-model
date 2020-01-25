const validateCanDeleteAllRows = rows => {
  const rowKeys = rows.map(row => row.key);
  rows.forEach(row => {
    const { dependents } = row;
    if (dependents) {
      // any shadow scenarios based on these?
      const { scenarios } = dependents;
      if (scenarios) {
        throw new Error(
          `Cannot delete row '${row.key}' as '${scenarios.join(", ")}' depend${
            scenarios.length > 1 ? "" : "s"
          } on it.`
        );
      }
      // can delete all if they are dependent only on each other
      dependents.rows.forEach(dependent => {
        if (!rowKeys.includes(dependent)) {
          throw new Error(
            `Cannot delete row '${row.key}' as row '${dependent}' depends on it.`
          );
        }
      });
    }
  });
};

module.exports = validateCanDeleteAllRows;
