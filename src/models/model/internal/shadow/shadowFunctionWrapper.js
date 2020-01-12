const shadowFunctionWrapper = ({ shadowFn, shadowFnArgs, baseScenario }) => {
  const fn = (rowContext, interval) => {
    const { model, row } = rowContext;
    const value = model[interval][row.index][baseScenario.index];
    return shadowFn({ ...rowContext, ...shadowFnArgs, value });
  };
  fn.key = shadowFn.key;
  return fn;
};

module.exports = shadowFunctionWrapper;
