const { lookup, previous } = require('./coreFunctions');
const { add, divide, multiply } = require('../maths/coreOperations');

const applyInterest = (args) => {
    const previousValue = previous(args)
    const percent = lookup(args);

}
applyInterest.key = 'applyInterest';
