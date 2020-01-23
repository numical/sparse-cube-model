const shadowFunctionWrapper = ({ fn, fnArgs, baseScenario }) => {
  const wrapper = (rowContext, interval) => {
    const { model, row } = rowContext;
    const value = model[interval][row.index][baseScenario.index];
    return fn({ ...rowContext, fnArgs }, interval, value);
  };
  wrapper.key = fn.key;
  return wrapper;
};

module.exports = shadowFunctionWrapper;
