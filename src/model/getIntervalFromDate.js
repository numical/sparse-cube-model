const generateCalcFn = ({ epoch, duration, count }) => {
  const start = new Date(epoch);
  const calcYear = date => date.getFullYear() - start.getFullYear();
  const calcMonth = date => date.getMonth() - start.getMonth();
  const boundsCheck = (fn, date) => {
    const interval = fn(date);
    if (interval < 0) {
      throw new Error(`'${date.toDateString()}' earlier than model start.`);
    } else if (interval >= count) {
      throw new Error(`'${date.toDateString()}' later than model end.`);
    } else {
      return interval;
    }
  };
  switch (duration) {
    case "month":
      return boundsCheck.bind(
        null,
        date => calcYear(date) * 12 + calcMonth(date)
      );
    case "year":
      return boundsCheck.bind(null, calcYear);
    default:
      throw new Error(`Unknown interval duration '${duration}'.`);
  }
};

module.exports = generateCalcFn;
