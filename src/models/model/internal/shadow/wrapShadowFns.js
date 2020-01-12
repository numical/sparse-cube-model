const shadowFunctionWrapper = require("./shadowFunctionWrapper");

const wrapShadowFns = ({ scenario, ...rest }) => {
  Object.values(scenario.rows).forEach(row => {
    row.fn = shadowFunctionWrapper({ ...rest });
  });
};

module.exports = wrapShadowFns;
