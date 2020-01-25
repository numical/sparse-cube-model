const shadowFunctionWrapper = ({ baseScenario, dependsOn, fn, fnArgs }) => {
  const wrapper = (rowContext, interval) => {
    const { model, row } = rowContext;
    return fn(
      {
        ...rowContext,
        baseScenario,
        fnArgs: { ...rowContext.fnArgs, ...fnArgs },
        dependsOn: { ...rowContext.dependsOn, ...dependsOn }
      },
      interval,
      model[interval][row.index][baseScenario.index]
    );
  };
  wrapper.key = fn.key;
  return wrapper;
};

module.exports = shadowFunctionWrapper;
