const bindFnToRow = (row, scenario, model, fn, fnArgs) => {
  if (fn) {
    const boundFn = fn.bind(this, { model, scenario, row, ...fnArgs });
    boundFn.key = fn.key;
    row.fn = boundFn;
    row.fnArgs = fnArgs;
  } else {
    row.fn = undefined;
    row.fnArgs = undefined;
  }
};

module.exports = bindFnToRow;
