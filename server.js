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
const LEGACY_PROBLEM_JSON_KEYS = ["question", "answer", "steps", "explanation"];

function getAiSettings() {
  const provider = String(process.env.AI_PROVIDER || (process.env.DEEPSEEK_API_KEY ? "deepseek" : "openai")).toLowerCase();
  const apiKey = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || "";
  const model = process.env.AI_MODEL || (provider === "deepseek" ? "deepseek-chat" : "gpt-4.1-mini");
  const baseURL = process.env.AI_BASE_URL || (provider === "deepseek" ? "https://api.deepseek.com" : "");
  return { provider, apiKey, model, baseURL };
}

function createAiClient() {
  const settings = getAiSettings();
  if (!settings.apiKey) {
    return null;
  }

  const options = {
    apiKey: settings.apiKey
  };

  if (settings.baseURL) {
    options.baseURL = settings.baseURL;
  }

  return new OpenAI(options);
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
      `The json object must contain exactly these keys: ${LEGACY_PROBLEM_JSON_KEYS.join(", ")}.`,
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
    keys.length === LEGACY_PROBLEM_JSON_KEYS.length &&
    LEGACY_PROBLEM_JSON_KEYS.every((key) => keys.includes(key))
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

function normalizeGeneratedQuestion(value, fallback = null) {
  const parsed = typeof value === "string" ? JSON.parse(String(value || "").trim()) : value;
  const question = typeof parsed?.question === "string" ? parsed.question.trim() : "";
  const answer = typeof parsed?.answer === "string" ? parsed.answer.trim() : "";
  const analysis = typeof parsed?.analysis === "string" && parsed.analysis.trim()
    ? parsed.analysis.trim()
    : typeof parsed?.explanation === "string"
      ? parsed.explanation.trim()
      : "";
  const knowledgePoint = typeof parsed?.knowledge_point === "string" && parsed.knowledge_point.trim()
    ? parsed.knowledge_point.trim()
    : typeof fallback?.knowledge_point === "string"
      ? fallback.knowledge_point
      : "";
  const difficulty = Number(parsed?.difficulty ?? fallback?.difficulty ?? 1);
  const aliases = Array.isArray(parsed?.aliases)
    ? parsed.aliases.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const steps = Array.isArray(parsed?.steps)
    ? parsed.steps.map((item) => String(item || "").trim()).filter(Boolean)
    : Array.isArray(fallback?.steps)
      ? fallback.steps
      : [];

  if (!question || !answer || !analysis) {
    throw new Error("AI question json is incomplete");
  }

  return {
    question,
    answer,
    answerValue: parsed?.answerValue ?? undefined,
    aliases,
    steps: steps.length > 0 ? steps : [analysis],
    analysis,
    explanation: analysis,
    knowledge_point: knowledgePoint,
    difficulty: Number.isFinite(difficulty) ? Math.min(5, Math.max(1, Math.round(difficulty))) : 1,
    type: typeof parsed?.type === "string" && parsed.type.trim() ? parsed.type.trim() : "ai-generated",
    variantStyle: typeof parsed?.variantStyle === "string" && parsed.variantStyle.trim() ? parsed.variantStyle.trim() : undefined,
    errorTags: Array.isArray(parsed?.errorTags)
      ? parsed.errorTags.map((item) => String(item || "").trim()).filter(Boolean)
      : []
  };
}

function fallbackQuestionFromBody(body) {
  try {
    return normalizeGeneratedQuestion(body?.localQuestion, {
      steps: body?.localQuestion?.steps || []
    });
  } catch (error) {
    return {
      question: "请根据当前知识点写出一个核心概念或公式。",
      answer: "根据当前知识点的定义或公式回答。",
      aliases: [],
      steps: ["回忆定义", "写出对应公式或性质"],
      explanation: "当前未配置 AI，系统已回退到本地基础题。",
      type: "local-fallback"
    };
  }
}

function normalizeGradeResult(value) {
  const parsed = typeof value === "string" ? JSON.parse(String(value || "").trim()) : value;
  return {
    isCorrect: Boolean(parsed?.isCorrect),
    reason: typeof parsed?.reason === "string" ? parsed.reason.trim() : "",
    feedback: typeof parsed?.feedback === "string" ? parsed.feedback.trim() : ""
  };
}

async function callAiJson(systemPrompt, payload, options = {}) {
  const client = createAiClient();
  if (!client) {
    return null;
  }
  const settings = getAiSettings();
  const completion = await client.chat.completions.create({
    model: settings.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(payload) }
    ],
    response_format: { type: "json_object" },
    max_tokens: options.max_tokens || 650,
    temperature: options.temperature ?? 0.45
  });

  const content = completion.choices?.[0]?.message?.content || "";
  return JSON.parse(content);
}

async function askDeepSeek(payload) {
  const client = createAiClient();
  if (!client) {
    return localAnswer(payload);
  }
  const settings = getAiSettings();

  const request = {
    model: settings.model,
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

async function handleGenerateQuestion(req, res) {
  const body = req.body || {};
  const fallback = fallbackQuestionFromBody(body);
  const client = createAiClient();

  if (!client) {
    res.status(200).json(fallback);
    return;
  }

  try {
    const prompt = [
      "你是 AI数学陪练小程序的出题引擎，面向小学1-6年级和初中7-9年级学生。",
      "只能返回一个 JSON 对象，不允许 Markdown、代码块或多余解释。",
      "JSON 必须包含 question、answer、analysis、knowledge_point、difficulty、type。",
      "可额外包含 answerValue、aliases、steps、variantStyle、errorTags，aliases、steps、errorTags 必须是字符串数组。",
      "输入会提供年级、知识点、难度1-5、题型和本地种子题，请按这些信息生成题目。",
      "变式不能只换数字，必须从同语义变式、反向提问、生活化应用题、易错辨析、多步骤推理中选择一种。",
      "题目要符合给定 modelId、年级和领域，答案必须稳定、可批改，不要生成超纲内容。",
      "analysis 要给出清晰解析，difficulty 必须是 1 到 5 的整数，type 必须是 基础题、应用题、变式题、多步骤题 之一。",
      "如果无法生成高质量变式，就返回与 localQuestion 同知识点但参数、场景或问法变化后的 JSON。"
    ].join("\n");
    const payload = {
      modelId: body.modelId,
      grade: body.grade,
      domain: body.domain,
      difficulty: body.difficulty,
      questionType: body.questionType,
      mode: body.mode,
      studentProfile: body.studentProfile,
      localQuestion: fallback
    };

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const aiQuestion = await callAiJson(prompt, payload, { max_tokens: 650, temperature: 0.8 });
        res.status(200).json(normalizeGeneratedQuestion(aiQuestion, fallback));
        return;
      } catch (error) {
        // Retry once when the model returns invalid JSON or an incomplete answer.
      }
    }

    res.status(200).json(fallback);
  } catch (error) {
    res.status(200).json(fallback);
  }
}

async function handleGradeAnswer(req, res) {
  const body = req.body || {};
  const client = createAiClient();

  if (!client) {
    res.status(200).json({
      isCorrect: false,
      reason: "未配置服务端 AI，且本地规则无法确认该答案。",
      feedback: "请对照标准答案订正，或使用更明确的数字、关键词作答。"
    });
    return;
  }

  try {
    const result = await callAiJson(
      [
        "你是严格的初中数学答案语义批改器。",
        "只能返回一个 JSON 对象，不允许 Markdown、代码块或多余解释。",
        "JSON 必须包含 isCorrect、reason、feedback。",
        "数字题不要随意放宽；只有用户答案与标准答案数学意义一致时才能判正确。",
        "如果用户只是表达方式不同，但语义等价，可以判正确。"
      ].join("\n"),
      {
        question: body.question,
        standardAnswer: body.standardAnswer,
        answerValue: body.answerValue,
        aliases: Array.isArray(body.aliases) ? body.aliases : [],
        userAnswer: body.userAnswer,
        modelId: body.modelId
      },
      { max_tokens: 360, temperature: 0.1 }
    );

    res.status(200).json(normalizeGradeResult(result));
  } catch (error) {
    res.status(200).json({
      isCorrect: false,
      reason: "AI 语义批改暂时不可用。",
      feedback: "请对照标准答案和步骤订正。"
    });
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
app.post("/api/generate-question", handleGenerateQuestion);
app.post("/api/grade-answer", handleGradeAnswer);

app.all("/api/ask", (req, res) => {
  res.status(405).json({ error: "只支持 POST /api/ask" });
});

app.all("/api/generate-question", (req, res) => {
  res.status(405).json({ error: "只支持 POST /api/generate-question" });
});

app.all("/api/grade-answer", (req, res) => {
  res.status(405).json({ error: "只支持 POST /api/grade-answer" });
});

app.listen(PORT, () => {
  console.log(`AI Math Learning V4 running at http://localhost:${PORT}`);
});
