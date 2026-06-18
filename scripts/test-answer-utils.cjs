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

const { isAnswerCorrect, parseMathValue, gradeAnswerDetailed } = sandbox.module.exports;

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
assert.ok(Math.abs(parseMathValue("1/√2") - Math.SQRT1_2) < 1e-9);

const judgmentQuestion = {
  question: "一个等腰直角三角形，两条直角边都为1，斜边为√2。若一个同学说 sin45° = 1/√2，这个答案正确吗？如果正确，请化简；如果不正确，请说明理由。",
  answer: "正确，1/√2 = √2/2。",
  steps: ["sin45° = 对边 / 斜边", "sin45° = 1 / √2", "1/√2 = √2/2"]
};

assert.deepStrictEqual(
  {
    result: gradeAnswerDetailed("正确", judgmentQuestion.answer, judgmentQuestion).result,
    score: gradeAnswerDetailed("正确", judgmentQuestion.answer, judgmentQuestion).score
  },
  { result: "partial", score: 60 }
);
assert.strictEqual(gradeAnswerDetailed("正确，化简为√2/2", judgmentQuestion.answer, judgmentQuestion).result, "correct");
assert.strictEqual(gradeAnswerDetailed("错误", judgmentQuestion.answer, judgmentQuestion).result, "wrong");

console.log(`answer-utils tests passed: ${cases.length} cases`);
