const isDependentOn = (row1, row2) => {
  const dependsOn = row1.dependsOn;
  const name = row2.rowName || row2.name;
  return !dependsOn
    ? false
    : typeof dependsOn === "object"
    ? Object.values(dependsOn).includes(name)
    : dependsOn === name;
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
