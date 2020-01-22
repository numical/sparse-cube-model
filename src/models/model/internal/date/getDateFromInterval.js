const generateCalcFn = ({ epoch, duration, count }) => {
  const start = new Date(epoch);
  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  switch (duration) {
    case "month":
      return interval => new Date(startYear, startMonth + interval, 1);
    case "year":
      return interval => new Date(startYear + interval, startMonth, 1);
    default:
      throw new Error(`Unknown interval duration '${duration}'.`);
  }
};

module.exports = generateCalcFn;
