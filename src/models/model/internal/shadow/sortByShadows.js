const isShadowOf = (scenario1, scenario2) =>
  scenario1.shadows && scenario1.shadows[scenario2.name];

const sortByShadows = (scenario1, scenario2) => {
  if (isShadowOf(scenario1, scenario2)) {
    return 1;
  } else if (isShadowOf(scenario2, scenario2)) {
    return -1;
  } else {
    return 0;
  }
};

module.exports = sortByShadows;
