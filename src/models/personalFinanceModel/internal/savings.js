const { previous } = require("../../../fns/lookupFunctions");
const { applyAnnualisedInterest } = require("../../../fns/interestFunctions");
const keys = require("./keys");

const checkMandatoryFields = ({ name, startDate }) => {
  if (name === undefined) {
    throw new Error("Savings must have a name.");
  }
  if (startDate === undefined) {
    throw new Error("Savings must have a start date.");
  }
};

const add = ({
  model,
  productIndex,
  startDate,
  endDate,
  startAmount = 0,
  regularContribution = 0,
  interestRate = 0
}) => {
  const interestKey = `${keys.savings.row.interestRate}_${productIndex}`;
  const contributionKey = `${keys.savings.row.contribution}_${productIndex}`;
  model.addRow({
    rowKey: interestKey,
    constants: [interestRate],
    fn: previous,
    start: startDate,
    end: endDate
  });
  model.addRow({
    rowKey: contributionKey,
    constants: [regularContribution],
    fn: previous,
    start: startDate,
    end: endDate
  });
  model.addRow({
    rowKey: `${keys.savings.row.amount}_${productIndex}`,
    constants: [startAmount],
    fn: applyAnnualisedInterest,
    dependsOn: {
      interest: interestKey,
      increment: contributionKey
    },
    start: startDate,
    end: endDate
  });
};

module.exports = {
  add,
  checkMandatoryFields
};
