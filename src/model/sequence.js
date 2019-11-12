module.exports = (length, mapFn = (_, i) => i) => Array.from({ length }, mapFn);
