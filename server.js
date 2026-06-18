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
const PROBLEM_JSON_KEYS = ["question", "hint", "steps", "answer"];

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

function localStructuredProblem({ modelId, modelName, parameters }) {
  const p = parameters || {};
  const radius = Number(p.radius || 5);
  const base = Number(p.base || 8);
  const height = Number(p.height || 6);
  const a = Number(p.a || 1);
  const h = Number(p.h || 0);
  const k = Number(p.k || 0);
  const angle = Number(p.angle || 120);

  const fallback = {
    question: `请结合当前「${modelName || "数学模型"}」参数，计算关键量并说明公式来源。`,
    hint: "先识别题目给出的参数，再选择对应公式。",
    steps: ["列出已知量", "写出对应公式", "代入参数计算"],
    answer: "根据当前参数代入公式即可得到答案。"
  };

  const problems = {
    circle: {
      question: `学校要铺设一个半径为 ${round(radius)} 米的圆形花坛，花坛面积约是多少平方米？`,
      hint: "圆面积公式是 S = πr²，把半径代入即可。",
      steps: [`已知 r=${round(radius)}`, "使用 S = πr²", `S≈3.14×${round(radius)}²`],
      answer: `面积约为 ${round(Math.PI * radius * radius)} 平方米。`
    },
    triangle: {
      question: `一块三角形展示牌的底为 ${round(base)} 米，高为 ${round(height)} 米，它的面积是多少平方米？`,
      hint: "三角形面积等于底乘高再除以 2。",
      steps: [
        `已知 b=${round(base)}，h=${round(height)}`,
        "使用 S = 1/2 × b × h",
        `S=1/2×${round(base)}×${round(height)}`
      ],
      answer: `面积是 ${round((base * height) / 2)} 平方米。`
    },
    parabola: {
      question: `抛物线 y=${round(a)}(x-${round(h)})²+${round(k)} 表示拱门轮廓，它的顶点和开口方向是什么？`,
      hint: "顶点式 y=a(x-h)²+k 的顶点是 (h,k)，a 的符号决定开口方向。",
      steps: [
        "识别顶点式 y=a(x-h)²+k",
        `读出 h=${round(h)}，k=${round(k)}`,
        `根据 a=${round(a)} 判断开口方向`
      ],
      answer: `顶点是 (${round(h)}, ${round(k)})，开口${a >= 0 ? "向上" : "向下"}。`
    },
    sector: {
      question: `一个扇形草坪半径为 ${round(radius)} 米，圆心角为 ${round(angle)}°，它的弧长约是多少米？`,
      hint: "扇形弧长是整圆周长按圆心角比例取一部分。",
      steps: [
        `已知 r=${round(radius)}，θ=${round(angle)}°`,
        "使用 L = θ/360° × 2πr",
        `L≈${round(angle)}/360×2×3.14×${round(radius)}`
      ],
      answer: `弧长约为 ${round((angle / 360) * 2 * Math.PI * radius)} 米。`
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
      "你必须只返回 JSON，禁止输出 Markdown、解释、代码块或任何多余文字。",
      "不要把 JSON 包在字符串里，不要添加 question/hint/steps/answer 之外的字段。",
      "JSON 格式必须严格如下：",
      '{"question":"题目内容","hint":"解题提示","steps":["步骤1","步骤2","步骤3"],"answer":"最终答案"}',
      "字段要求：question、hint、answer 必须是字符串；steps 必须是字符串数组，至少 3 项。"
    ].join("\n");
  }

  return "你是数学AI课件系统里的助教。用中文回答，面向中学生，解释要短、清楚、带公式意识。";
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
  const hint = typeof parsed?.hint === "string" ? parsed.hint.trim() : "";
  const steps = Array.isArray(parsed?.steps)
    ? parsed.steps.map((step) => (typeof step === "string" ? step.trim() : "")).filter(Boolean)
    : [];
  const answer = typeof parsed?.answer === "string" ? parsed.answer.trim() : "";
  const hasValidShape =
    hasOnlyProblemJsonKeys(parsed) &&
    question &&
    hint &&
    steps.length > 0 &&
    answer;

  if (!hasValidShape) {
    throw new Error("AI返回格式错误，请重试");
  }

  return JSON.stringify({
    question,
    hint,
    steps,
    answer
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
    temperature: payload.intent === "generate_problem" ? 0.2 : 0.7
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

app.post("/api/ask", handleAsk);

app.all("/api/ask", (req, res) => {
  res.status(405).json({ error: "只支持 POST /api/ask" });
});

app.listen(PORT, () => {
  console.log(`AI Math Learning V4 running at http://localhost:${PORT}`);
});
