const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const source = fs.readFileSync(path.join(__dirname, "..", "public", "js", "answer-utils.js"), "utf8");
const sandbox = {
  window: {},
  module: { exports: {} }
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const { isAnswerCorrect, parseMathValue } = sandbox.module.exports;

const cases = [
  { correctAnswer: "1/2", userAnswer: "0.5", expected: true },
  { correctAnswer: "1/2", userAnswer: "0.50", expected: true },
  { correctAnswer: "1/2", userAnswer: "2/4", expected: true },
  { correctAnswer: "0.5", userAnswer: "1/2", expected: true },
  { correctAnswer: "1", userAnswer: "1.0", expected: true },
  { correctAnswer: "1/3", userAnswer: "0.3333333333", expected: true },
  { correctAnswer: "1/2", userAnswer: "0.6", expected: false },
  { correctAnswer: "1/2", userAnswer: "50%", expected: true },
  { correctAnswer: " 1 / 2 ", userAnswer: ".5", expected: true },
  { correctAnswer: "２／４", userAnswer: "0.5", expected: true },
  { correctAnswer: "√2/2", userAnswer: String(Math.sqrt(2) / 2), expected: true }
];

for (const item of cases) {
  assert.strictEqual(
    isAnswerCorrect(item.userAnswer, item.correctAnswer),
    item.expected,
    `${item.userAnswer} vs ${item.correctAnswer}`
  );
}

assert.strictEqual(parseMathValue("1 / 2"), 0.5);
assert.strictEqual(parseMathValue("50%"), 0.5);
assert.strictEqual(parseMathValue(".5"), 0.5);

console.log(`answer-utils tests passed: ${cases.length} cases`);
