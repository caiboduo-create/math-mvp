(function () {
  const svgNs = "http://www.w3.org/2000/svg";
  const searchParams = new URLSearchParams(window.location.search);
  const modelId = searchParams.get("id");
  const registry = window.MathCoursewareModels;
  const model = registry.getModel(modelId);
  const round = registry.round;
  const state = {};
  let currentQuestion = null;
  const recentQuestionTexts = [];

  const title = document.getElementById("modelTitle");
  const description = document.getElementById("modelDescription");
  const sliders = document.getElementById("sliderPanel");
  const metrics = document.getElementById("metricPanel");
  const askForm = document.getElementById("askForm");
  const askInput = document.getElementById("askInput");
  const askResult = document.getElementById("askResult");
  const svg = document.getElementById("modelSvg");
  const mistakeCount = document.getElementById("mistakeCount");
  const generateProblemButton = document.getElementById("generateProblemButton");
  const aiProblemBox = document.getElementById("aiProblemBox");
  const gradeForm = document.getElementById("gradeForm");
  const studentAnswer = document.getElementById("studentAnswer");
  const resultCard = document.getElementById("resultCard");
  const gradeResult = document.getElementById("gradeResult");
  const statTotal = document.getElementById("statTotal");
  const statCorrect = document.getElementById("statCorrect");
  const statWrong = document.getElementById("statWrong");
  const statRate = document.getElementById("statRate");
  const resetStatsButton = document.getElementById("resetStatsButton");

  if (!model) {
    document.title = "模型不存在 - AI数学学习产品V4";
    title.textContent = "模型不存在";
    description.textContent = "请返回首页选择一个已配置的数学模型。";
    sliders.innerHTML = "";
    metrics.innerHTML = "";
    askForm.hidden = true;
    gradeForm.hidden = true;
    resultCard.hidden = false;
    gradeResult.hidden = false;
    gradeResult.className = "grade-result-card is-wrong";
    gradeResult.textContent = "当前 URL 没有提供有效的模型 id。";
    if (generateProblemButton) {
      generateProblemButton.disabled = true;
    }
    if (resetStatsButton) {
      resetStatsButton.disabled = true;
    }
    updateStatsPanel();
    updateMistakeCount();
    return;
  }

  document.title = `${model.name} - AI数学学习产品V4`;
  title.textContent = model.name;
  description.textContent = model.description;

  function svgEl(name, attrs = {}, text = "") {
    const el = document.createElementNS(svgNs, name);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    if (text) {
      el.textContent = text;
    }
    return el;
  }

  function clearSvg() {
    svg.setAttribute("viewBox", "0 0 480 360");
    svg.replaceChildren();
  }

  function addText(text, x, y, className = "svg-label") {
    svg.appendChild(svgEl("text", { x, y, class: className }, text));
  }

  function addGrid() {
    for (let x = 60; x <= 420; x += 40) {
      svg.appendChild(svgEl("line", { x1: x, y1: 40, x2: x, y2: 320, class: "grid-line" }));
    }
    for (let y = 40; y <= 320; y += 40) {
      svg.appendChild(svgEl("line", { x1: 60, y1: y, x2: 420, y2: y, class: "grid-line" }));
    }
    svg.appendChild(svgEl("line", { x1: 60, y1: 180, x2: 420, y2: 180, class: "axis-line" }));
    svg.appendChild(svgEl("line", { x1: 240, y1: 40, x2: 240, y2: 320, class: "axis-line" }));
  }

  function polar(cx, cy, r, angleDeg) {
    const angle = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  }

  const visualRenderers = {
    circle() {
      clearSvg();
      const r = state.radius * 14;
      const cx = 240;
      const cy = 180;
      svg.appendChild(svgEl("circle", { cx, cy, r, class: "shape-fill" }));
      svg.appendChild(svgEl("circle", { cx, cy, r, class: "shape-outline" }));
      svg.appendChild(svgEl("line", { x1: cx, y1: cy, x2: cx + r, y2: cy, class: "measure-line" }));
      svg.appendChild(svgEl("circle", { cx, cy, r: 4, class: "point-dot pulse" }));
      svg.appendChild(svgEl("circle", { cx: cx + r, cy, r: 5, class: "point-dot" }));
      addText(`r = ${round(state.radius)}`, cx + r / 2 - 14, cy - 10);
      addText(model.name, 220, 45, "svg-title");
    },

    triangle() {
      clearSvg();
      const base = state.base * 28;
      const height = state.height * 24;
      const shift = state.shift * 22;
      const y = 292;
      const x1 = 240 - base / 2;
      const x2 = 240 + base / 2;
      const apexX = 240 + shift;
      const apexY = y - height;
      const points = `${x1},${y} ${x2},${y} ${apexX},${apexY}`;
      svg.appendChild(svgEl("polygon", { points, class: "shape-fill" }));
      svg.appendChild(svgEl("polygon", { points, class: "shape-outline" }));
      svg.appendChild(svgEl("line", { x1: apexX, y1: apexY, x2: apexX, y2: y, class: "measure-line dashed" }));
      svg.appendChild(svgEl("line", { x1, y1: y + 16, x2, y2: y + 16, class: "measure-line" }));
      svg.appendChild(svgEl("circle", { cx: apexX, cy: apexY, r: 5, class: "point-dot pulse" }));
      addText(`b = ${round(state.base)}`, 220, y + 42);
      addText(`h = ${round(state.height)}`, apexX + 10, apexY + height / 2);
      addText(model.name, 205, 45, "svg-title");
    },

    parabola() {
      clearSvg();
      addGrid();

      const sx = (x) => 240 + x * 18;
      const sy = (y) => 180 - y * 18;
      let path = "";

      for (let x = -10; x <= 10; x += 0.25) {
        const y = state.a * Math.pow(x - state.h, 2) + state.k;
        const px = sx(x);
        const py = Math.max(24, Math.min(336, sy(y)));
        path += path ? ` L ${px} ${py}` : `M ${px} ${py}`;
      }

      svg.appendChild(svgEl("path", { d: path, class: "curve-line" }));
      svg.appendChild(svgEl("line", { x1: sx(state.h), y1: 40, x2: sx(state.h), y2: 320, class: "measure-line dashed" }));
      svg.appendChild(svgEl("circle", { cx: sx(state.h), cy: sy(state.k), r: 6, class: "point-dot pulse" }));
      addText(`顶点 (${round(state.h)}, ${round(state.k)})`, sx(state.h) + 12, sy(state.k) - 12);
      addText(model.name, 205, 32, "svg-title");
    },

    sector() {
      clearSvg();
      const cx = 240;
      const cy = 194;
      const r = state.radius * 15;
      const start = polar(cx, cy, r, 0);
      const end = polar(cx, cy, r, state.angle);
      const largeArc = state.angle > 180 ? 1 : 0;
      const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;

      svg.appendChild(svgEl("path", { d, class: "shape-fill" }));
      svg.appendChild(svgEl("path", { d, class: "shape-outline" }));
      svg.appendChild(svgEl("line", { x1: cx, y1: cy, x2: start.x, y2: start.y, class: "measure-line" }));
      svg.appendChild(svgEl("line", { x1: cx, y1: cy, x2: end.x, y2: end.y, class: "measure-line" }));
      svg.appendChild(svgEl("circle", { cx, cy, r: 5, class: "point-dot pulse" }));
      addText(`θ = ${round(state.angle)}°`, cx + 16, cy - 20);
      addText(`r = ${round(state.radius)}`, (cx + start.x) / 2 + 8, (cy + start.y) / 2);
      addText(model.name, 222, 45, "svg-title");
    }
  };

  function renderSvg() {
    const renderer = visualRenderers[model.visual];
    if (renderer) {
      renderer();
      return;
    }

    clearSvg();
    addText("暂未配置图形渲染器", 150, 180, "svg-title");
  }

  function renderMetrics() {
    const modelMetrics = model.metrics(state);
    metrics.replaceChildren();
    Object.entries(modelMetrics).forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "metric-item";
      item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
      metrics.appendChild(item);
    });
  }

  function renderAll() {
    renderSvg();
    renderMetrics();
  }

  function buildSliders() {
    sliders.replaceChildren();

    model.params.forEach((param) => {
      state[param.key] = param.value;

      const control = document.createElement("label");
      control.className = "slider-control";
      control.innerHTML = `
        <span class="slider-label">
          <span>${param.label}</span>
          <strong id="${param.key}Value">${round(param.value)}${param.unit || ""}</strong>
        </span>
        <input type="range" min="${param.min}" max="${param.max}" step="${param.step}" value="${param.value}" data-key="${param.key}" />
      `;

      const input = control.querySelector("input");
      const value = control.querySelector("strong");

      input.addEventListener("input", () => {
        state[param.key] = Number(input.value);
        value.textContent = `${round(state[param.key])}${param.unit || ""}`;
        renderAll();
      });

      sliders.appendChild(control);
    });
  }

  function statsStorageKey() {
    return model ? `mathStats_${model.id}` : "mathStats_unknown";
  }

  function normalizeStats(value) {
    const correct = Math.max(0, Number(value?.correct) || 0);
    const wrong = Math.max(0, Number(value?.wrong) || 0);
    return {
      correct,
      wrong,
      total: correct + wrong
    };
  }

  function getStats() {
    try {
      const raw = localStorage.getItem(statsStorageKey());
      return normalizeStats(raw ? JSON.parse(raw) : null);
    } catch (error) {
      return normalizeStats(null);
    }
  }

  function saveStats(stats) {
    localStorage.setItem(statsStorageKey(), JSON.stringify(normalizeStats(stats)));
  }

  function updateStatsPanel() {
    const stats = getStats();
    const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    statTotal.textContent = String(stats.total);
    statCorrect.textContent = String(stats.correct);
    statWrong.textContent = String(stats.wrong);
    statRate.textContent = `${rate}%`;
  }

  function incrementStats(correct) {
    const stats = getStats();
    if (correct) {
      stats.correct += 1;
    } else {
      stats.wrong += 1;
    }
    saveStats(stats);
    updateStatsPanel();
    updateMistakeCount();
  }

  function resetStats() {
    saveStats({ correct: 0, wrong: 0 });
    updateStatsPanel();
    updateMistakeCount();
  }

  function mistakeStorageKey() {
    return "math-ai-v4-mistakes";
  }

  function getMistakes() {
    try {
      const raw = localStorage.getItem(mistakeStorageKey());
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveMistakes(mistakes) {
    localStorage.setItem(mistakeStorageKey(), JSON.stringify(mistakes));
  }

  function updateMistakeCount() {
    const count = model ? getStats().wrong : 0;
    mistakeCount.textContent = `本模型错题数量：${count}`;
  }

  function recordMistake(question, userAnswer, correct) {
    if (correct) {
      return;
    }

    const mistakes = getMistakes();
    mistakes.push({
      model: model.id,
      question,
      userAnswer,
      correct: false,
      createdAt: new Date().toISOString()
    });
    saveMistakes(mistakes);
    updateMistakeCount();
  }

  async function askAi(question, options = {}) {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: options.intent,
        modelId: model.id,
        modelName: model.name,
        question,
        parameters: state
      })
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || "AI 请求失败");
    }
    return data.answer || "AI 暂时没有返回内容。";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatAiAnswerHtml(rawText) {
    const cleanedText = String(rawText || "")
      .replace(/\r\n/g, "\n")
      .replace(/```[a-zA-Z0-9_-]*\n?/g, "")
      .replace(/```/g, "")
      .replace(/^\s{0,3}#{1,6}\s*(.+)$/gm, "$1")
      .replace(/^\s{0,3}[*+-]\s+/gm, "")
      .replace(/^\s{0,3}[-*_]{3,}\s*$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return escapeHtml(cleanedText)
      .replace(/\*\*([\s\S]*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*\*/g, "")
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
      .replace(/^\s*\*\s*/gm, "")
      .replace(/`/g, "")
      .replace(/\n/g, "<br>");
  }

  function renderAskResult(message) {
    askResult.hidden = false;
    askResult.innerHTML = formatAiAnswerHtml(message);
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function choice(items) {
    return items[randomInt(0, items.length - 1)];
  }

  function cleanNumber(value) {
    return Number(round(value, 2));
  }

  function answerText(value, unit) {
    return `${round(value, 2)}${unit}`;
  }

  function squaredUnit(unit) {
    return `平方${unit}`;
  }

  function formatParabolaFormula(a, h, k) {
    const hPart = h === 0 ? "x" : `x${h < 0 ? "+" : "-"}${Math.abs(h)}`;
    const kPart = k === 0 ? "" : `${k > 0 ? "+" : ""}${k}`;
    return `y=${a}(${hPart})²${kPart}`;
  }

  function nearCurrent(value, min, max, variance = 0.45) {
    if (!Number.isFinite(Number(value)) || Math.abs(Number(value)) < 1) {
      return randomInt(min, max);
    }

    const lower = Math.max(min, Math.floor(value * (1 - variance)));
    const upper = Math.min(max, Math.ceil(value * (1 + variance)));
    return randomInt(lower, Math.max(lower, upper));
  }

  function buildGeneratedQuestion() {
    const units = ["厘米", "米", "毫米"];
    const unit = choice(units);
    const askAreaText = [
      "求它的面积。",
      "这个图形的面积是多少？",
      "请计算它的面积。",
      "它占地多少平方单位？"
    ];

    if (model.id === "circle") {
      const radius = nearCurrent(state.radius, 2, 18);
      const mode = choice(["area", "circumference"]);

      if (mode === "circumference") {
        const value = cleanNumber(2 * Math.PI * radius);
        return {
          question: choice([
            `一个圆形跑道的半径是 ${radius}${unit}，求它的周长。`,
            `圆形徽章半径为 ${radius}${unit}，它的边缘长度约是多少？`,
            `半径为 ${radius}${unit} 的圆，周长约是多少？`
          ]),
          answer: answerText(value, unit),
          answerValue: value,
          tolerance: Math.max(0.1, value * 0.02),
          steps: [`已知半径 r=${radius}${unit}`, "圆的周长公式：C = 2πr", `C≈2×3.14×${radius}=${round(value, 2)}${unit}`],
          explanation: "周长表示绕圆一圈的长度，只需要把半径代入 2πr。"
        };
      }

      const value = cleanNumber(Math.PI * radius * radius);
      return {
        question: choice([
          `一个圆形花坛的半径是 ${radius}${unit}，${choice(askAreaText)}`,
          `半径为 ${radius}${unit} 的圆形纸片，面积约是多少？`,
          `学校画了一个半径 ${radius}${unit} 的圆，求这个圆的面积。`
        ]),
        answer: answerText(value, squaredUnit(unit)),
        answerValue: value,
        tolerance: Math.max(0.1, value * 0.02),
        steps: [`已知半径 r=${radius}${unit}`, "圆面积公式：S = πr²", `S≈3.14×${radius}²=${round(value, 2)}${squaredUnit(unit)}`],
        explanation: "圆面积和半径的平方有关，半径变大时面积增长更快。"
      };
    }

    if (model.id === "triangle") {
      const base = nearCurrent(state.base, 4, 24);
      const height = nearCurrent(state.height, 3, 20);
      const value = cleanNumber((base * height) / 2);
      return {
        question: choice([
          `一个三角形的底边长为 ${base}${unit}，高为 ${height}${unit}，${choice(askAreaText)}`,
          `一块三角形广告牌底边 ${base}${unit}、高 ${height}${unit}，面积是多少？`,
          `三角形小旗的底是 ${base}${unit}，对应高是 ${height}${unit}，请算出面积。`,
          `底边为 ${base}${unit}、高为 ${height}${unit} 的三角形，面积等于多少？`
        ]),
        answer: answerText(value, squaredUnit(unit)),
        answerValue: value,
        tolerance: Math.max(0.05, value * 0.02),
        steps: [`已知底 b=${base}${unit}，高 h=${height}${unit}`, "三角形面积公式：S = b×h÷2", `S=${base}×${height}÷2=${round(value, 2)}${squaredUnit(unit)}`],
        explanation: "三角形面积等于同底同高长方形面积的一半。"
      };
    }

    if (model.id === "parabola") {
      const a = choice([-2, -1, 1, 2]);
      const h = nearCurrent(state.h, -5, 5, 1);
      const k = nearCurrent(state.k, -6, 6, 1);
      const formula = formatParabolaFormula(a, h, k);
      const openText = a > 0 ? "向上" : "向下";
      const mode = choice(["open", "vertex", "axis", "value"]);

      if (mode === "open") {
        return {
          question: choice([
            `已知抛物线 ${formula}，它的开口方向是什么？`,
            `观察函数 ${formula}，判断这条抛物线开口向上还是向下。`,
            `二次函数 ${formula} 的 a=${a}，请写出开口方向。`
          ]),
          answer: openText,
          acceptedTexts: [openText],
          steps: [`二次函数顶点式为 y=a(x-h)²+k`, `这里 a=${a}`, `a${a > 0 ? "＞0" : "＜0"}，所以开口${openText}`],
          explanation: "判断开口方向只看 a 的正负：a 大于 0 开口向上，a 小于 0 开口向下。"
        };
      }

      if (mode === "vertex") {
        return {
          question: choice([
            `已知抛物线 ${formula}，写出它的顶点坐标。`,
            `函数 ${formula} 的顶点在哪里？`,
            `请判断二次函数 ${formula} 的顶点坐标。`
          ]),
          answer: `(${h}, ${k})`,
          answerNumbers: [h, k],
          tolerance: 0.01,
          steps: ["顶点式为 y=a(x-h)²+k", `式子中 h=${h}，k=${k}`, `所以顶点坐标是 (${h}, ${k})`],
          explanation: "顶点式可以直接读出顶点坐标，括号里的 h 是横坐标，外面的 k 是纵坐标。"
        };
      }

      if (mode === "axis") {
        return {
          question: choice([
            `已知抛物线 ${formula}，它的对称轴是什么？`,
            `函数 ${formula} 的对称轴方程是？`,
            `请写出抛物线 ${formula} 的对称轴。`
          ]),
          answer: `x=${h}`,
          answerNumbers: [h],
          acceptedTexts: [`x=${h}`, `x＝${h}`],
          tolerance: 0.01,
          steps: ["顶点式为 y=a(x-h)²+k", `式子中 h=${h}`, `所以对称轴是 x=${h}`],
          explanation: "顶点式的对称轴总是经过顶点，方程是 x=h。"
        };
      }

      const x = h + choice([-3, -2, -1, 1, 2, 3]);
      const value = cleanNumber(a * Math.pow(x - h, 2) + k);
      return {
        question: choice([
          `已知抛物线 ${formula}，当 x=${x} 时，y 的值是多少？`,
          `一条抛物线满足 ${formula}，代入 x=${x}，求 y。`,
          `函数 ${formula} 中，x=${x} 对应的函数值是多少？`
        ]),
        answer: `${round(value, 2)}`,
        answerValue: value,
        tolerance: 0.05,
        steps: [`把 x=${x} 代入 ${formula}`, `y=${a}×(${x}-${h})²+${k}`, `y=${round(value, 2)}`],
        explanation: "顶点式中先算括号里的差，再平方、乘系数，最后加上 k。"
      };
    }

    const radius = nearCurrent(state.radius || 6, 2, 18);
    const angle = randomInt(2, 22) * 15;
    const mode = choice(["area", "arc"]);

    if (mode === "arc") {
      const value = cleanNumber((angle / 360) * 2 * Math.PI * radius);
      return {
        question: choice([
          `一个扇形半径为 ${radius}${unit}，圆心角为 ${angle}°，求它的弧长。`,
          `半径 ${radius}${unit}、圆心角 ${angle}° 的扇形，弧长约是多少？`,
          `扇形草坪的半径是 ${radius}${unit}，圆心角是 ${angle}°，它的弧长约为多少？`
        ]),
        answer: answerText(value, unit),
        answerValue: value,
        tolerance: Math.max(0.1, value * 0.03),
        steps: [`已知 r=${radius}${unit}，θ=${angle}°`, "弧长公式：L = θ/360° × 2πr", `L≈${angle}/360×2×3.14×${radius}=${round(value, 2)}${unit}`],
        explanation: "扇形弧长就是整圆周长按圆心角比例取一部分。"
      };
    }

    const value = cleanNumber((angle / 360) * Math.PI * radius * radius);
    return {
      question: choice([
        `一个扇形半径为 ${radius}${unit}，圆心角为 ${angle}°，求它的面积。`,
        `半径 ${radius}${unit}、圆心角 ${angle}° 的扇形，面积约是多少？`,
        `扇形纸片的半径是 ${radius}${unit}，圆心角是 ${angle}°，请计算面积。`
      ]),
      answer: answerText(value, squaredUnit(unit)),
      answerValue: value,
      tolerance: Math.max(0.1, value * 0.03),
      steps: [`已知 r=${radius}${unit}，θ=${angle}°`, "扇形面积公式：S = θ/360° × πr²", `S≈${angle}/360×3.14×${radius}²=${round(value, 2)}${squaredUnit(unit)}`],
      explanation: "扇形面积等于整圆面积按圆心角比例取一部分。"
    };
  }

  function extractNumbers(text) {
    const matches = text.match(/-?\d+(?:\.\d+)?/g) || [];
    return matches.map(Number).filter((value) => Number.isFinite(value));
  }

  function normalizeAnswerText(text) {
    return String(text || "")
      .replace(/\s+/g, "")
      .replace(/＝/g, "=")
      .toLowerCase();
  }

  function isAnswerCorrect(userAnswer, question) {
    const normalized = normalizeAnswerText(userAnswer);

    if (Array.isArray(question.acceptedTexts)) {
      const hasAcceptedText = question.acceptedTexts.some((item) => {
        const accepted = normalizeAnswerText(item);
        return accepted && normalized.includes(accepted);
      });
      if (hasAcceptedText) {
        return true;
      }
    }

    const numbers = extractNumbers(userAnswer);
    const tolerance = Number(question.tolerance) || 0.01;

    if (Array.isArray(question.answerNumbers) && question.answerNumbers.length > 0) {
      return question.answerNumbers.every((target) =>
        numbers.some((value) => Math.abs(value - target) <= tolerance)
      );
    }

    if (Number.isFinite(question.answerValue)) {
      return numbers.some((value) => Math.abs(value - question.answerValue) <= tolerance);
    }

    return false;
  }

  function createProblemSection(titleText, content) {
    const section = document.createElement("section");
    section.className = "problem-section";

    const heading = document.createElement("h3");
    heading.textContent = titleText;
    section.appendChild(heading);

    if (Array.isArray(content)) {
      const list = document.createElement("ol");
      content.forEach((step) => {
        const item = document.createElement("li");
        item.textContent = step;
        list.appendChild(item);
      });
      section.appendChild(list);
    } else {
      const paragraph = document.createElement("p");
      paragraph.textContent = content;
      section.appendChild(paragraph);
    }

    return section;
  }

  function renderQuestion(problem) {
    aiProblemBox.classList.remove("muted-box", "format-error");
    aiProblemBox.replaceChildren(createProblemSection("题目", problem.question));
  }

  function renderGradeResult(problem, userAnswer, correct) {
    resultCard.hidden = false;
    gradeResult.hidden = false;
    gradeResult.className = `grade-result-card ${correct ? "is-correct" : "is-wrong"}`;
    gradeResult.replaceChildren(
      createProblemSection("是否正确", correct ? "正确" : "错误"),
      createProblemSection("你的答案", userAnswer),
      createProblemSection("正确答案", problem.answer),
      createProblemSection("解题步骤", problem.steps),
      createProblemSection("简单讲解", problem.explanation)
    );
  }

  function renderGradeMessage(message) {
    resultCard.hidden = false;
    gradeResult.hidden = false;
    gradeResult.className = "grade-result-card is-wrong";
    gradeResult.textContent = message;
  }

  generateProblemButton.addEventListener("click", () => {
    aiProblemBox.textContent = "正在随机出题...";
    aiProblemBox.classList.remove("muted-box", "format-error");
    resultCard.hidden = true;
    gradeResult.hidden = true;
    gradeResult.replaceChildren();
    studentAnswer.value = "";
    generateProblemButton.disabled = true;
    generateProblemButton.textContent = "生成中...";

    window.setTimeout(() => {
      let nextQuestion = buildGeneratedQuestion();
      for (let attempt = 0; attempt < 12 && recentQuestionTexts.includes(nextQuestion.question); attempt += 1) {
        nextQuestion = buildGeneratedQuestion();
      }

      currentQuestion = nextQuestion;
      recentQuestionTexts.push(currentQuestion.question);
      if (recentQuestionTexts.length > 12) {
        recentQuestionTexts.shift();
      }

      renderQuestion(currentQuestion);
      generateProblemButton.disabled = false;
      generateProblemButton.textContent = "随机出题";
    }, 120);
  });

  gradeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const userAnswer = studentAnswer.value.trim();

    if (!currentQuestion) {
      renderGradeMessage("请先点击随机出题生成题目。");
      return;
    }

    if (!userAnswer) {
      renderGradeMessage("请先填写你的答案。");
      return;
    }

    const correct = isAnswerCorrect(userAnswer, currentQuestion);
    renderGradeResult(currentQuestion, userAnswer, correct);
    incrementStats(correct);
    recordMistake(currentQuestion.question, userAnswer, correct);
  });

  resetStatsButton.addEventListener("click", () => {
    if (window.confirm("确定要清空当前模型的答题统计吗？")) {
      resetStats();
    }
  });

  askForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = askInput.value.trim();

    if (!question) {
      renderAskResult("请输入一个问题。");
      return;
    }

    renderAskResult("AI 正在思考...");

    try {
      renderAskResult(await askAi(question));
    } catch (error) {
      renderAskResult(error.message || "请通过 npm start 启动服务后再使用问AI。");
    }
  });

  buildSliders();
  renderAll();
  updateStatsPanel();
  updateMistakeCount();
})();
