const indexOfRowKey = (rowKey, scenarios) => {
  return Object.values(scenarios).reduce(
    (maxIndex, { rows }) =>
      maxIndex > -1 ? maxIndex : Object.keys(rows).indexOf(rowKey),
    -1
  );
};

module.exports = indexOfRowKey;
