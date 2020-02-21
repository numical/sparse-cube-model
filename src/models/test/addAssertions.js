const round = pounds => Math.round(pounds * 100);

const addAssertions = test => {
  test.equalToNearestPenny = (found, wanted, message, extra) =>
    test.equal(round(found), round(wanted), message, extra);
  return test;
};

module.exports = addAssertions;
