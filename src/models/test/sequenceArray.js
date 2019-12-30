const sequence = (length, start = 0, mapFn = (start, _, i) => start + i) =>
  Array.from({ length }, mapFn.bind(null, start));

module.exports = sequence;
