const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const source = fs.readFileSync(path.join(__dirname, "..", "public", "js", "teaching-engine.js"), "utf8");
const sandbox = {
  window: {},
  module: { exports: {} }
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const engine = sandbox.module.exports;

function validate(question, context) {
  return engine.validateQuestion(question, context);
}

const probabilityContext = {
  modelId: "probability",
  chapter: "概率初步",
  domain: "统计与概率",
  grade: "九年级",
  knowledgePoint: "简单概率"
};

const probabilityQuestion = {
  chapter: "概率初步",
  knowledge_point: "简单概率",
  type: "摸球问题",
  question: "一个袋子里有3个红球、2个白球，随机摸出1个球，摸到红球的概率是多少？",
  answer: "3/5",
  standardAnswer: "3/5"
};

const wrongProbabilityQuestion = {
  chapter: "概率初步",
  knowledge_point: "相似三角形比例",
  type: "相似三角形比例",
  question: "两个相似三角形的相似比为2:1，小三角形对应边为3厘米，大三角形对应边是多少？",
  answer: "6厘米"
};

const probabilityValidation = validate(probabilityQuestion, probabilityContext);
assert.strictEqual(probabilityValidation.valid, true);
assert.strictEqual(probabilityValidation.question.templateType, "probability_simple");

const wrongProbabilityValidation = validate(wrongProbabilityQuestion, probabilityContext);
assert.strictEqual(wrongProbabilityValidation.valid, false);

const probabilityLesson = engine.buildAnimationLesson(probabilityQuestion, {});
assert.strictEqual(probabilityLesson.visual_type, "probability");
assert.ok(probabilityLesson.animation_steps.length >= 3);

const similarityContext = {
  modelId: "similar-triangle",
  chapter: "相似三角形",
  domain: "图形与几何",
  grade: "九年级",
  knowledgePoint: "相似三角形"
};

const similarityQuestion = {
  chapter: "相似三角形",
  knowledge_point: "相似三角形比例",
  type: "相似三角形比例",
  question: "两个三角形相似，对应边之比为3:1。小三角形一条边长4厘米，大三角形对应边长多少厘米？",
  answer: "12厘米",
  answerValue: 12
};

const similarityValidation = validate(similarityQuestion, similarityContext);
assert.strictEqual(similarityValidation.valid, true);
assert.strictEqual(similarityValidation.question.templateType, "similar_triangle_ratio");

const wrongSimilarityValidation = validate(probabilityQuestion, similarityContext);
assert.strictEqual(wrongSimilarityValidation.valid, false);

const similarityLesson = engine.buildAnimationLesson(similarityQuestion, {});
assert.strictEqual(similarityLesson.visual_type, "similar_triangle");
assert.ok(similarityLesson.animation_steps.length >= 3);

const trigContext = {
  modelId: "trigonometry",
  chapter: "锐角三角函数",
  domain: "图形与几何",
  grade: "九年级",
  knowledgePoint: "锐角三角函数"
};

const trigQuestion = {
  chapter: "锐角三角函数",
  knowledge_point: "sin45°",
  type: "sin45°",
  question: "一个等腰直角三角形，两条直角边都为1，斜边为√2，求 sin45° 的值是多少？",
  answer: "√2/2"
};

const trigValidation = validate(trigQuestion, trigContext);
assert.strictEqual(trigValidation.valid, true);
assert.strictEqual(trigValidation.question.templateType, "right_triangle_trig");

const wrongTrigValidation = validate(similarityQuestion, trigContext);
assert.strictEqual(wrongTrigValidation.valid, false);

const trigLesson = engine.buildAnimationLesson(trigQuestion, {});
assert.strictEqual(trigLesson.visual_type, "right_triangle_trig");
assert.ok(trigLesson.animation_steps.length >= 3);

console.log("teaching-engine tests passed");
