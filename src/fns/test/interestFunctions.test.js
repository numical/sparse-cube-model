const { test } = require("tap");
const interestFunctions = require("../interestFunctions");

const testCases = [
  {
    subject: "applyInterest",
    duration: "year",
    amount: 100,
    interest: 5,
    expected: 105
  },
  {
    subject: "applyInterest",
    duration: "year",
    amount: 60,
    interest: 5,
    expected: 63
  },
  {
    subject: "applyInterest",
    duration: "year",
    amount: 10,
    interest: 5,
    expected: 10.5
  },
  {
    subject: "applyInterest",
    duration: "year",
    amount: 1000,
    interest: 3.05,
    expected: 1030.5
  },
  {
    subject: "applyInterest",
    duration: "year",
    amount: 1234.56,
    interest: 3.05,
    expected: 1272.21408
  },
  {
    subject: "applyInterest",
    duration: "year",
    amount: 1000,
    interest: 3.05,
    expected: 1272.21408,
    increment: 235,
    decrement: 0.44
  },
  {
    subject: "applyInterest",
    duration: "month",
    amount: 100,
    interest: 5,
    expected: 105
  },
  {
    subject: "applyInterest",
    duration: "month",
    amount: 60,
    interest: 5,
    expected: 63
  },
  {
    subject: "applyInterest",
    duration: "month",
    amount: 10,
    interest: 5,
    expected: 10.5
  },
  {
    subject: "applyInterest",
    duration: "month",
    amount: 1000,
    interest: 3.05,
    expected: 1030.5
  },
  {
    subject: "applyInterest",
    duration: "month",
    amount: 1234.56,
    interest: 3.05,
    expected: 1272.21408
  },
  {
    subject: "applyInterest",
    duration: "month",
    amount: 1000,
    interest: 3.05,
    expected: 1272.21408,
    increment: 235,
    decrement: 0.44
  },
  {
    subject: "applyAnnualisedInterest",
    duration: "month",
    amount: 100,
    interest: 60,
    expected: 105
  },
  {
    subject: "applyAnnualisedInterest",
    duration: "month",
    amount: 60,
    interest: 60,
    expected: 105,
    increment: 40
  },
  {
    subject: "applyAnnualisedInterest",
    duration: "month",
    amount: 120,
    interest: 12,
    expected: 101,
    decrement: 20
  },
  {
    subject: "applyAnnualisedInterest",
    duration: "month",
    amount: 1234.56,
    interest: 3.05,
    expected: 1237.69784
  },
  {
    subject: "applyAnnualisedCompoundInterest",
    duration: "month",
    amount: 100,
    interest: 60,
    expected: 103.99441076905043
  },
  {
    subject: "applyAnnualisedCompoundInterest",
    duration: "month",
    amount: 70,
    interest: 60,
    expected: 103.99441076905043,
    increment: 50,
    decrement: 20
  },
  {
    subject: "applyAnnualisedCompoundInterest",
    duration: "month",
    amount: 100,
    interest: 12,
    expected: 100.9488792934583
  },
  {
    subject: "applyAnnualisedCompoundInterest",
    duration: "month",
    amount: 1000,
    interest: 3.05,
    expected: 1237.6548117919046,
    increment: 234.56
  }
];

const interval = 1;

const generateDescription = ({
  subject,
  amount,
  duration,
  interest,
  increment,
  decrement,
  expected
}) =>
  `${subject} (${duration}): expect (${amount} + ${increment ||
    "no increment"} - ${decrement ||
    "no decrement"} ) * ${interest}% to be ${expected}`;

const generateArgs = ({ amount, duration, interest, increment, decrement }) => {
  const dependsOn = {
    interest: "interestRow",
    increment: increment ? "incrementRow" : undefined,
    decrement: decrement ? "decrementRow" : undefined
  };
  return {
    model: {
      0: {
        0: {
          0: amount
        }
      },
      1: {
        1: {
          0: interest
        },
        2: {
          0: increment
        },
        3: {
          0: decrement
        }
      }
    },
    scenario: {
      index: 0,
      rows: {
        interestRow: {
          index: 1
        },
        incrementRow: {
          index: 2
        },
        decrementRow: {
          index: 3
        }
      }
    },
    row: {
      index: 0
    },
    intervals: {
      duration
    },
    dependsOn
  };
};

testCases.forEach(testCase => {
  test(generateDescription(testCase), t => {
    const args = generateArgs(testCase);
    t.same(
      interestFunctions[testCase.subject](args, interval),
      testCase.expected
    );
    t.end();
  });
});
