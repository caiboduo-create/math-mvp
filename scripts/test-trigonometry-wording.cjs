const fs = require("fs");
const path = require("path");

const trainerSource = fs.readFileSync(path.join(__dirname, "..", "public", "js", "trainer-app.js"), "utf8");
const modelsSource = fs.readFileSync(path.join(__dirname, "..", "public", "models.js"), "utf8");

for (const source of [trainerSource, modelsSource]) {
  if (source.includes("小明需要计算一个等腰直角三角形的斜边长度，已知直角边长为1，那么sin 45°对应的边长比例是多少？")) {
    throw new Error("旧的混合目标题目仍然存在");
  }
}

const requiredPhrases = [
  "一个等腰直角三角形，两条直角边都为1，求斜边长度是多少？",
  "一个等腰直角三角形，两条直角边都为1，斜边为√2，求 sin45° 的值是多少？",
  "sin45° = 对边 / 斜边 = 1 / √2 = √2 / 2"
];

for (const phrase of requiredPhrases) {
  if (!trainerSource.includes(phrase) && !modelsSource.includes(phrase)) {
    throw new Error(`缺少清晰题目或讲解文本：${phrase}`);
  }
}

console.log("trigonometry wording tests passed");
