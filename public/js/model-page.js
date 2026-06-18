(function () {
  const svgNs = "http://www.w3.org/2000/svg";
  const searchParams = new URLSearchParams(window.location.search);
  const modelId = searchParams.get("id");
  const registry = window.MathCoursewareModels;
  const model = registry.getModel(modelId);
  const round = registry.round;
  const state = {};
  let currentAiProblem = null;
  const problemJsonKeys = ["question", "hint", "steps", "answer"];
  const problemSections = [
    ["question", "📘 题目"],
    ["hint", "💡 提示"],
    ["steps", "🧠 步骤"],
    ["answer", "🎯 答案"]
  ];

  const title = document.getElementById("modelTitle");
  const description = document.getElementById("modelDescription");
  const sliders = document.getElementById("sliderPanel");
  const metrics = document.getElementById("metricPanel");
  const explanation = document.getElementById("aiExplanation");
  const exerciseQuestion = document.getElementById("exerciseQuestion");
  const exerciseAnswer = document.getElementById("exerciseAnswer");
  const answerToggle = document.getElementById("answerToggle");
  const askForm = document.getElementById("askForm");
  const askInput = document.getElementById("askInput");
  const askResult = document.getElementById("askResult");
  const svg = document.getElementById("modelSvg");
  const mistakeCount = document.getElementById("mistakeCount");
  const generateProblemButton = document.getElementById("generateProblemButton");
  const aiProblemBox = document.getElementById("aiProblemBox");
  const gradeForm = document.getElementById("gradeForm");
  const studentAnswer = document.getElementById("studentAnswer");
  const gradeResult = document.getElementById("gradeResult");

  if (!model) {
    document.title = "模型不存在 - AI数学学习产品V4";
    title.textContent = "模型不存在";
    description.textContent = "请返回首页选择一个已配置的数学模型。";
    sliders.innerHTML = "";
    metrics.innerHTML = "";
    explanation.textContent = "当前 URL 没有提供有效的模型 id。";
    exerciseQuestion.textContent = "暂无练习题。";
    answerToggle.hidden = true;
    askForm.hidden = true;
    if (generateProblemButton) {
      generateProblemButton.disabled = true;
    }
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

  function renderContent() {
    const exercise = model.exercise(state);
    explanation.textContent = model.explanation(state);
    exerciseQuestion.textContent = exercise.question;
    exerciseAnswer.textContent = exercise.answer;
    exerciseAnswer.hidden = true;
    answerToggle.textContent = "查看答案";
  }

  function renderAll() {
    renderSvg();
    renderMetrics();
    renderContent();
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

  function getCurrentModelMistakes() {
    return getMistakes().filter((item) => item.model === modelId);
  }

  function updateMistakeCount() {
    const count = model ? getCurrentModelMistakes().length : 0;
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

  function currentParameterText() {
    return model.params.map((param) => `${param.label}=${round(state[param.key])}${param.unit || ""}`).join("，");
  }

  function buildProblemPrompt() {
    return [
      "请生成 1 道结构化数学应用题。",
      `模型：${model.name}（id=${model.id}）`,
      `当前参数：${currentParameterText()}`,
      `模型说明：${model.description}`,
      "只返回 JSON。"
    ].join("\n");
  }

  function buildGradePrompt(userAnswer) {
    return [
      "请扮演数学老师，对学生答案进行自动批改。",
      `模型：${model.name}（id=${model.id}）`,
      `当前参数：${currentParameterText()}`,
      `题目：${currentAiProblem.question}`,
      `提示：${currentAiProblem.hint}`,
      `参考步骤：${currentAiProblem.steps.join("；")}`,
      `参考答案：${currentAiProblem.answer}`,
      `学生答案：${userAnswer}`,
      "请严格按下面格式返回：",
      "判断结果：只写 正确 或 错误",
      "正确步骤：给出清晰步骤和关键公式",
      "错误原因：如果错误，说明错在哪里；如果正确，写“无”。"
    ].join("\n");
  }

  function parseCorrectness(aiText) {
    const lines = aiText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const resultLine = lines.find((line) => /^判断结果[:：]/.test(line));

    if (resultLine) {
      const hasCorrect = resultLine.includes("正确");
      const hasWrong = resultLine.includes("错误") || resultLine.includes("不正确");
      return hasCorrect && !hasWrong;
    }

    return false;
  }

  function renderGradeResult(aiText, correct) {
    gradeResult.hidden = false;
    gradeResult.className = `grade-result-card ${correct ? "is-correct" : "is-wrong"}`;
    gradeResult.textContent = `${correct ? "✔ 判断：正确" : "✘ 判断：需要订正"}\n\n${aiText}`;
  }

  function parseProblemJson(aiText) {
    try {
      if (typeof aiText !== "string") {
        throw new Error("invalid-type");
      }

      const text = aiText.trim();
      if (!text.startsWith("{") || !text.endsWith("}")) {
        throw new Error("invalid-json-wrapper");
      }

      const parsed = JSON.parse(text);
      const parsedKeys = parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? Object.keys(parsed)
        : [];
      const hasOnlyExpectedKeys =
        parsedKeys.length === problemJsonKeys.length &&
        problemJsonKeys.every((key) => parsedKeys.includes(key));
      const steps = Array.isArray(parsed?.steps)
        ? parsed.steps.map((step) => (typeof step === "string" ? step.trim() : "")).filter(Boolean)
        : [];
      const question = typeof parsed?.question === "string" ? parsed.question.trim() : "";
      const hint = typeof parsed?.hint === "string" ? parsed.hint.trim() : "";
      const answer = typeof parsed?.answer === "string" ? parsed.answer.trim() : "";
      const hasValidShape =
        hasOnlyExpectedKeys &&
        question &&
        hint &&
        steps.length > 0 &&
        answer;

      if (!hasValidShape) {
        throw new Error("invalid-shape");
      }

      return {
        question,
        hint,
        steps,
        answer
      };
    } catch (error) {
      throw new Error("problem-json-invalid");
    }
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

  function renderStructuredProblem(problem) {
    aiProblemBox.classList.remove("muted-box", "format-error");
    aiProblemBox.replaceChildren(
      ...problemSections.map(([key, titleText]) => createProblemSection(titleText, problem[key]))
    );
  }

  function renderProblemFormatError() {
    aiProblemBox.classList.remove("muted-box");
    aiProblemBox.classList.add("format-error");
    aiProblemBox.replaceChildren(createProblemSection("格式错误", "AI返回格式错误，请重试"));
  }

  answerToggle.addEventListener("click", () => {
    exerciseAnswer.hidden = !exerciseAnswer.hidden;
    answerToggle.textContent = exerciseAnswer.hidden ? "查看答案" : "收起答案";
  });

  generateProblemButton.addEventListener("click", async () => {
    aiProblemBox.textContent = "AI 正在出题...";
    aiProblemBox.classList.remove("muted-box", "format-error");
    gradeForm.hidden = true;
    gradeResult.hidden = true;
    studentAnswer.value = "";
    generateProblemButton.disabled = true;

    try {
      const aiText = await askAi(buildProblemPrompt(), { intent: "generate_problem" });
      currentAiProblem = parseProblemJson(aiText);
      renderStructuredProblem(currentAiProblem);
      gradeForm.hidden = false;
    } catch (error) {
      currentAiProblem = null;
      if (error.message === "problem-json-invalid") {
        renderProblemFormatError();
      } else {
        renderProblemFormatError();
      }
    } finally {
      generateProblemButton.disabled = false;
    }
  });

  gradeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const userAnswer = studentAnswer.value.trim();

    if (!currentAiProblem) {
      gradeResult.hidden = false;
      gradeResult.className = "grade-result-card is-wrong";
      gradeResult.textContent = "请先点击“AI出题”生成题目。";
      return;
    }

    if (!userAnswer) {
      gradeResult.hidden = false;
      gradeResult.className = "grade-result-card is-wrong";
      gradeResult.textContent = "请先填写你的答案。";
      return;
    }

    gradeResult.hidden = false;
    gradeResult.className = "grade-result-card";
    gradeResult.textContent = "AI 正在批改...";

    try {
      const aiText = await askAi(buildGradePrompt(userAnswer));
      const correct = parseCorrectness(aiText);
      renderGradeResult(aiText, correct);
      recordMistake(currentAiProblem.question, userAnswer, correct);
    } catch (error) {
      gradeResult.className = "grade-result-card is-wrong";
      gradeResult.textContent = error.message || "AI 批改失败，请稍后再试。";
    }
  });

  askForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = askInput.value.trim();

    if (!question) {
      askResult.hidden = false;
      askResult.textContent = "请输入一个问题。";
      return;
    }

    askResult.hidden = false;
    askResult.textContent = "AI 正在思考...";

    try {
      askResult.textContent = await askAi(question);
    } catch (error) {
      askResult.textContent = error.message || "请通过 npm start 启动服务后再使用问AI。";
    }
  });

  buildSliders();
  renderAll();
  updateMistakeCount();
})();
