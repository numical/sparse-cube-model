const bindFnToRow = (row, scenario, model, fn, fnArgs) => {
  if (fn) {
    const fnToBind = fn.unbound || fn;
    const boundFn = fnToBind.bind(this, { model, scenario, row, ...fnArgs });
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
