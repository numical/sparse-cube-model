const bindFnToRow = (model, intervals, scenario, row, fn, fnArgs) => {
  if (fn) {
    const fnToBind = fn.unbound || fn;
    const boundFn = fnToBind.bind(this, {
      model,
      intervals,
      scenario,
      row,
      ...fnArgs
    });
    boundFn.key = fn.key;
    boundFn.unbound = fnToBind;
    row.fn = boundFn;
    row.fnArgs = fnArgs;
  } else {
    row.fn = undefined;
    row.fnArgs = undefined;
  }
};

module.exports = bindFnToRow;
