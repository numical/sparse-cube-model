const shadowFunctionWrapper = (shadowFn, baseScenario) => {
  const fn = (rowContext, interval) => {
    const { model, row } = rowContext;
    const value = model[interval][row.index][baseScenario.index];
    return shadowFn({ ...rowContext, value });
  };
  fn.key = shadowFn.key;
  return fn;
};

module.exports = shadowFunctionWrapper;
