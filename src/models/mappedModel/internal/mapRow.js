const mapRow = (toRowKey, row) => ({
  ...row,
  name: toRowKey(row.name),
  dependsOn: toRowKey(row.dependsOn)
});

module.exports = mapRow;
