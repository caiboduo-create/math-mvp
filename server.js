import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

const PORT = Number(process.env.PORT || 3001);
const DEEPSEEK_MODEL = "deepseek-chat";
const PROBLEM_JSON_KEYS = ["question", "answer", "steps", "explanation"];

function createDeepSeekClient() {
  if (!process.env.DEEPSEEK_API_KEY) {
    return null;
  }

  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com"
  });

  return client;
}

function round(value, digits = 2) {
  return Number(value).toFixed(digits).replace(/\.?0+$/, "");
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(items) {
  return items[randomInt(0, items.length - 1)];
}

function formatParabolaFormula(a, h, k) {
  const hPart = h === 0 ? "x" : `x${h < 0 ? "+" : "-"}${Math.abs(h)}`;
  const kPart = k === 0 ? "" : `${k > 0 ? "+" : ""}${k}`;
  return `y=${round(a)}(${hPart})²${kPart}`;
}

function localStructuredProblem({ modelId, modelName, parameters }) {
  const p = parameters || {};
  const unit = choice(["厘米", "米", "毫米"]);
  const radius = randomInt(2, Math.max(4, Math.round(Number(p.radius || 5) * 2)));
  const base = randomInt(4, Math.max(6, Math.round(Number(p.base || 8) * 2)));
  const height = randomInt(3, Math.max(5, Math.round(Number(p.height || 6) * 2)));
  const a = choice([-2, -1, 1, 2]);
  const h = randomInt(-4, 4);
  const k = randomInt(-5, 5);
  const x = h + choice([-3, -2, -1, 1, 2, 3]);
  const yValue = a * Math.pow(x - h, 2) + k;
  const angle = randomInt(2, 22) * 15;
  const circleMode = choice(["area", "circumference"]);
  const parabolaMode = choice(["open", "vertex", "axis", "value"]);
  const sectorMode = choice(["area", "arc"]);
  const openText = a > 0 ? "向上" : "向下";
  const parabolaFormula = formatParabolaFormula(a, h, k);

  const fallback = {
    question: `请结合当前「${modelName || "数学模型"}」参数，计算关键量并说明公式来源。`,
    answer: "根据当前参数代入公式即可得到答案。",
    steps: ["列出已知量", "写出对应公式", "代入参数计算"],
    explanation: "先识别题目给出的参数，再选择对应公式。"
  };

  const problems = {
    circle: circleMode === "circumference"
      ? {
          question: `一个圆形跑道的半径是 ${round(radius)}${unit}，求它的周长。`,
          answer: `${round(2 * Math.PI * radius)}${unit}`,
          steps: [`已知 r=${round(radius)}${unit}`, "圆周长公式：C = 2πr", `C≈2×3.14×${round(radius)}=${round(2 * Math.PI * radius)}${unit}`],
          explanation: "周长表示绕圆一圈的长度，把半径代入 2πr 即可。"
        }
      : {
          question: `一个圆形花坛的半径是 ${round(radius)}${unit}，求它的面积。`,
          answer: `${round(Math.PI * radius * radius)}平方${unit}`,
          steps: [`已知 r=${round(radius)}${unit}`, "圆面积公式：S = πr²", `S≈3.14×${round(radius)}²=${round(Math.PI * radius * radius)}平方${unit}`],
          explanation: "圆面积和半径的平方有关，把半径代入公式即可。"
        },
    triangle: {
      question: `一个三角形的底边长为 ${round(base)}${unit}，高为 ${round(height)}${unit}，求这个三角形的面积。`,
      answer: `${round((base * height) / 2)}平方${unit}`,
      steps: [
        `已知 b=${round(base)}${unit}，h=${round(height)}${unit}`,
        "三角形面积公式：S = b×h÷2",
        `S=${round(base)}×${round(height)}÷2=${round((base * height) / 2)}平方${unit}`
      ],
      explanation: "三角形面积等于同底同高长方形面积的一半。"
    },
    parabola: {
      open: {
        question: `已知抛物线 ${parabolaFormula}，判断它的开口方向。`,
        answer: openText,
        steps: ["顶点式为 y=a(x-h)²+k", `这里 a=${round(a)}`, `a${a > 0 ? "＞0" : "＜0"}，所以开口${openText}`],
        explanation: "判断开口方向只看 a 的正负。"
      },
      vertex: {
        question: `已知抛物线 ${parabolaFormula}，写出它的顶点坐标。`,
        answer: `(${round(h)}, ${round(k)})`,
        steps: ["顶点式为 y=a(x-h)²+k", `读出 h=${round(h)}，k=${round(k)}`, `顶点坐标是 (${round(h)}, ${round(k)})`],
        explanation: "顶点式可以直接读出顶点坐标。"
      },
      axis: {
        question: `已知抛物线 ${parabolaFormula}，写出它的对称轴。`,
        answer: `x=${round(h)}`,
        steps: ["顶点式为 y=a(x-h)²+k", `读出 h=${round(h)}`, `对称轴是 x=${round(h)}`],
        explanation: "顶点式的对称轴方程是 x=h。"
      },
      value: {
        question: `已知抛物线 ${parabolaFormula}，当 x=${round(x)} 时，y 的值是多少？`,
        answer: `${round(yValue)}`,
        steps: [
          `把 x=${round(x)} 代入 ${parabolaFormula}`,
          `y=${round(a)}×(${round(x)}-${round(h)})²+${round(k)}`,
          `y=${round(yValue)}`
        ],
        explanation: "先算括号里的差，再平方、乘系数，最后加上 k。"
      }
    }[parabolaMode],
    sector: sectorMode === "area"
      ? {
          question: `一个扇形半径为 ${round(radius)}${unit}，圆心角为 ${round(angle)}°，求它的面积。`,
          answer: `${round((angle / 360) * Math.PI * radius * radius)}平方${unit}`,
          steps: [
            `已知 r=${round(radius)}${unit}，θ=${round(angle)}°`,
            "面积公式：S = θ/360° × πr²",
            `S≈${round(angle)}/360×3.14×${round(radius)}²=${round((angle / 360) * Math.PI * radius * radius)}平方${unit}`
          ],
          explanation: "扇形面积就是整圆面积按圆心角比例取一部分。"
        }
      : {
          question: `一个扇形半径为 ${round(radius)}${unit}，圆心角为 ${round(angle)}°，求它的弧长。`,
          answer: `${round((angle / 360) * 2 * Math.PI * radius)}${unit}`,
          steps: [
            `已知 r=${round(radius)}${unit}，θ=${round(angle)}°`,
            "弧长公式：L = θ/360° × 2πr",
            `L≈${round(angle)}/360×2×3.14×${round(radius)}=${round((angle / 360) * 2 * Math.PI * radius)}${unit}`
          ],
          explanation: "扇形弧长就是整圆周长按圆心角比例取一部分。"
        }
  };

  return JSON.stringify(problems[modelId] || fallback);
}

function localAnswer(payload) {
  if (payload.intent === "generate_problem") {
    return localStructuredProblem(payload);
  }

  const paramText = Object.entries(payload.parameters || {})
    .map(([key, value]) => `${key}=${value}`)
    .join("，");

  return [
    `你正在研究「${payload.modelName || "数学模型"}」。`,
    payload.modelGrade || payload.modelDomain ? `所属范围：${[payload.modelGrade, payload.modelDomain].filter(Boolean).join(" · ")}。` : "",
    Array.isArray(payload.formula) && payload.formula.length > 0 ? `核心公式或规则：${payload.formula.join("；")}` : "",
    paramText ? `当前参数是：${paramText}。` : "",
    `关于“${payload.question}”，可以先抓住图形中的关键量，再代入对应公式。`,
    "如果题目问变化趋势，就观察滑块变化时图形面积、长度或位置怎样同步变化。"
  ]
    .filter(Boolean)
    .join("\n");
}

function systemPromptFor(payload) {
  if (payload.intent === "generate_problem") {
    return [
      "Return only one valid json object. Do not return prose, markdown, or code fences.",
      `The json object must contain exactly these keys: ${PROBLEM_JSON_KEYS.join(", ")}.`,
      "你是 AI数学学习产品V4 的数学出题引擎。",
      "你必须根据用户给出的数学模型和当前参数生成 1 道中学生应用题。",
      "每次都要变化题目参数、单位或问法，避免生成重复题目。",
      "你必须只返回 JSON，禁止输出 Markdown、解释、代码块或任何多余文字。",
      "不要把 JSON 包在字符串里，不要添加 question/answer/steps/explanation 之外的字段。",
      "JSON 格式必须严格如下：",
      '{"question":"题目内容","answer":"最终答案","steps":["步骤1","步骤2","步骤3"],"explanation":"简单讲解"}',
      "字段要求：question、answer、explanation 必须是字符串；steps 必须是字符串数组，至少 3 项。"
    ].join("\n");
  }

  return [
    "你是数学AI课件系统里的助教。用中文回答，面向中学生，解释要短、清楚、带公式意识。",
    "回答必须使用普通中文分段，不要使用 Markdown 语法。",
    "禁止使用 Markdown 加粗、标题、代码块、反引号或列表符号。",
    "可以直接写公式，例如：面积 =（圆心角 ÷ 360）× π × 半径²。",
    "如果解释平方关系，要用自然语言说明，不要用 Markdown 包裹公式。"
  ].join("\n");
}

function hasOnlyProblemJsonKeys(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return false;
  }

  const keys = Object.keys(parsed);
  return (
    keys.length === PROBLEM_JSON_KEYS.length &&
    PROBLEM_JSON_KEYS.every((key) => keys.includes(key))
  );
}

function normalizeStructuredProblemText(aiText) {
  const parsed = JSON.parse(String(aiText || "").trim());
  const question = typeof parsed?.question === "string" ? parsed.question.trim() : "";
  const answer = typeof parsed?.answer === "string" ? parsed.answer.trim() : "";
  const steps = Array.isArray(parsed?.steps)
    ? parsed.steps.map((step) => (typeof step === "string" ? step.trim() : "")).filter(Boolean)
    : [];
  const explanation = typeof parsed?.explanation === "string" ? parsed.explanation.trim() : "";
  const hasValidShape =
    hasOnlyProblemJsonKeys(parsed) &&
    question &&
    answer &&
    steps.length > 0 &&
    explanation;

  if (!hasValidShape) {
    throw new Error("AI返回格式错误，请重试");
  }

  return JSON.stringify({
    question,
    answer,
    steps,
    explanation
  });
}

async function askDeepSeek(payload) {
  const client = createDeepSeekClient();
  if (!client) {
    return localAnswer(payload);
  }

  const request = {
    model: DEEPSEEK_MODEL,
    messages: [
      {
        role: "system",
        content: systemPromptFor(payload)
      },
      {
        role: "user",
        content: JSON.stringify(payload)
      }
    ],
    max_tokens: payload.intent === "generate_problem" ? 700 : 500,
    temperature: payload.intent === "generate_problem" ? 0.85 : 0.7
  };

  if (payload.intent === "generate_problem") {
    request.response_format = { type: "json_object" };
  }

  const completion = await client.chat.completions.create(request);
  const answer = completion.choices?.[0]?.message?.content || localAnswer(payload);

  if (payload.intent === "generate_problem") {
    return normalizeStructuredProblemText(answer);
  }

  return answer;
}

async function handleAsk(req, res) {
  try {
    const body = req.body || {};
    const question = String(body.question || "").trim();

    if (!question) {
      res.status(400).json({ error: "请输入问题" });
      return;
    }

    const answer = await askDeepSeek({
      intent: body.intent,
      modelId: body.modelId,
      modelName: body.modelName,
      modelGrade: body.modelGrade,
      modelDomain: body.modelDomain,
      formula: body.formula,
      question,
      parameters: body.parameters || {}
    });

    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ error: error.message || "AI 请求失败" });
  }
}

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(publicDir, {
  etag: false,
  maxAge: 0
}));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/model.html", (req, res) => {
  res.sendFile(path.join(publicDir, "model.html"));
});

app.get("/_debug", (req, res) => {
  res.json({
    cwd: process.cwd(),
    filename: __filename,
    dirname: __dirname,
    version: "V4-railway-debug",
    time: new Date().toISOString()
  });
});

app.post("/api/ask", handleAsk);

app.all("/api/ask", (req, res) => {
  res.status(405).json({ error: "只支持 POST /api/ask" });
});

app.listen(PORT, () => {
  console.log(`AI Math Learning V4 running at http://localhost:${PORT}`);
});
