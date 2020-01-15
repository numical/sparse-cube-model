const mapRow = (toRowKey, row) => ({
  ...row,
  key: toRowKey(row.key),
  dependsOn: toRowKey(row.dependsOn)
});

module.exports = mapRow;
