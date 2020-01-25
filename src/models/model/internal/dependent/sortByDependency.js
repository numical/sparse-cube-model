const isDependentOn = (row1, row2) => {
  const dependsOn = row1.dependsOn;
  const key = row2.rowKey || row2.key;
  return dependsOn ? Object.values(dependsOn).includes(key) : false;
};

const sortByDependency = (row1, row2) => {
  if (isDependentOn(row1, row2)) {
    return 1;
  } else if (isDependentOn(row2, row1)) {
    return -1;
  } else {
    return 0;
  }
};

module.exports = sortByDependency;
