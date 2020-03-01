const keys = require("../keys");

const adjustForInflation = rowMeta => ({
    ...rowMeta,
    fnArgs: {
        ...rowMeta.fnArgs,
        [keys.inflation.fnArgs.adjustForInflation]: true
    }
});

module.exports = adjustForInflation;