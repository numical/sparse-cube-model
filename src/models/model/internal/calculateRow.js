const calculateRow = (row, scenario, startInterval, endInterval, set) => {
  for (let interval = startInterval; interval <= endInterval; interval++) {
    const value =
      row.constants[interval] === undefined
        ? row.fn(interval)
        : row.constants[interval];
    set(interval, row.index, scenario.index, value);
  }
};

module.exports = calculateRow;
