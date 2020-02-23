module.exports = {
  inflation: {
    row: {
      rate: "pfm.inflation.row.rate",
      multiplier: "pfm.inflation.row.multiplier"
    },
    fn: {
      calculateMultiplier: "pfm.inflation.fn.calculate.multiplier",
      applyInflation: "pfm.inflation.fn.apply.inflation"
    },
    fnArgs: {
      adjustForInflation: "pfm.inflation.fnArgs.adjust.for.inflation"
    },
    scenario: {
      suffix: "pfm.inflationAdjusted"
    }
  },
  savings: {
    row: {
      interestRate: "pfm.savings.interestRate.row",
      contribution: "pfm.contribution.row",
      amount: "pfm.savings.amount.row"
    }
  }
};
