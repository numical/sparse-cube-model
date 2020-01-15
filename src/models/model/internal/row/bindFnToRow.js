const bindFnToRow = (
  model,
  intervals,
  scenario,
  row,
  fn,
  fnArgs,
  dependsOn
) => {
  if (fn) {
    const fnToBind = fn.unbound || fn;
    const boundFn = fnToBind.bind(this, {
      model,
      intervals,
      scenario,
      row,
      dependsOn,
      fnArgs
    });
    boundFn.key = fn.key;
    boundFn.unbound = fnToBind;
    row.fn = boundFn;
    row.fnArgs = fnArgs;
    row.dependsOn = dependsOn;
  } else {
    row.fn = undefined;
    row.fnArgs = undefined;
    row.dependsOn = undefined;
  }
};

module.exports = bindFnToRow;
