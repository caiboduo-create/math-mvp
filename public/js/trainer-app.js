(function () {
  const app = document.getElementById("trainerApp");
  const statusBar = document.getElementById("trainerStatus");
  const navButtons = Array.from(document.querySelectorAll(".trainer-nav-button"));

  const STORAGE = {
    progress: "aiMathCoachProgressV1",
    mistakes: "aiMathCoachMistakesV1",
    history: "aiMathCoachHistoryV1"
  };

  const MODE_LABELS = {
    basic: "基础练习",
    advanced: "提高练习",
    mistake: "易错题",
    ai: "AI随机出题"
  };

  const MODE_HINTS = {
    basic: "先练核心题型，稳住基础分。",
    advanced: "加入条件变化和反向提问。",
    mistake: "聚焦常见错误，练会避坑。",
    ai: "本地模板打底，再生成语义变式。"
  };

  const TOPIC_GROUPS = {
    primary: [
      {
        grade: "一年级",
        topics: [
          topic("p1-add-sub-20", "20以内加减法", "小学数学", "数与运算", ["加法", "减法", "凑十"], "arithmetic-small"),
          topic("p1-compare", "比大小", "小学数学", "数与运算", ["大小比较", "序数"], "compare-number"),
          topic("p1-shapes", "认识图形", "小学数学", "图形与几何", ["长方形", "正方形", "圆"], "shape-recognition"),
          topic("p1-classify", "简单分类", "小学数学", "统计意识", ["分类", "整理"], "data-count")
        ]
      },
      {
        grade: "二年级",
        topics: [
          topic("p2-multiply-table", "表内乘法", "小学数学", "数与运算", ["乘法口诀", "倍数"], "multiplication"),
          topic("p2-division-table", "表内除法", "小学数学", "数与运算", ["平均分", "除法"], "division"),
          topic("p2-length-unit", "长度单位", "小学数学", "量与计量", ["厘米", "米", "换算"], "unit-length"),
          topic("p2-angle-basic", "角的初步认识", "小学数学", "图形与几何", ["直角", "锐角", "钝角"], "angle-basic")
        ]
      },
      {
        grade: "三年级",
        topics: [
          topic("p3-multi-operation", "多位数乘除法", "小学数学", "数与运算", ["竖式", "估算"], "multi-operation"),
          topic("p3-fraction-basic", "分数初步", "小学数学", "数与运算", ["几分之一", "比较"], "fraction-basic"),
          topic("p3-perimeter", "周长", "小学数学", "图形与几何", ["长方形", "正方形"], "perimeter"),
          topic("p3-data", "数据整理", "小学数学", "统计与概率", ["统计表", "条形图"], "data-count")
        ]
      },
      {
        grade: "四年级",
        topics: [
          topic("p4-large-number", "大数认识", "小学数学", "数与运算", ["读数", "改写", "近似数"], "place-value"),
          topic("p4-decimal", "小数意义", "小学数学", "数与运算", ["小数", "计数单位"], "decimal"),
          topic("p4-quadrilateral", "平行四边形和梯形", "小学数学", "图形与几何", ["高", "底", "分类"], "quadrilateral"),
          topic("p4-smart-calc", "简便运算", "小学数学", "数与运算", ["交换律", "结合律"], "smart-calc")
        ]
      },
      {
        grade: "五年级",
        topics: [
          topic("p5-decimal-operation", "小数乘除法", "小学数学", "数与运算", ["小数点", "估算"], "decimal-operation"),
          topic("p5-fraction-add", "分数加减法", "小学数学", "数与运算", ["通分", "约分"], "fraction-add"),
          topic("p5-cuboid", "长方体和正方体", "小学数学", "图形与几何", ["表面积", "体积"], "cuboid"),
          topic("p5-equation-basic", "方程初步", "小学数学", "数与代数", ["未知数", "等量关系"], "equation-basic")
        ]
      },
      {
        grade: "六年级",
        topics: [
          topic("p6-fraction-operation", "分数乘除法", "小学数学", "数与运算", ["倒数", "单位1"], "fraction-operation"),
          topic("p6-ratio", "比和比例", "小学数学", "数与代数", ["比值", "比例"], "ratio"),
          topic("p6-circle", "圆", "小学数学", "图形与几何", ["半径", "周长", "面积"], "circle"),
          topic("p6-percent", "百分数", "小学数学", "数与运算", ["百分率", "折扣"], "percent")
        ]
      }
    ],
    junior: [
      {
        grade: "七年级",
        topics: [
          topic("rational-number", "有理数", "初中数学", "数与代数", ["正负数", "数轴", "绝对值"], "signed-number", "model.html?id=rational-number"),
          topic("polynomial-add-sub", "整式加减", "初中数学", "数与代数", ["同类项", "去括号", "化简"], "like-terms", "model.html?id=polynomial-add-sub"),
          topic("linear-equation-one", "一元一次方程", "初中数学", "数与代数", ["方程", "移项", "应用题"], "linear-equation", "model.html?id=linear-equation-one"),
          topic("basic-geometry", "几何图形初步", "初中数学", "图形与几何", ["线段", "射线", "角"], "geometry-basic", "model.html?id=basic-geometry"),
          topic("coordinate-system", "平面直角坐标系", "初中数学", "函数", ["坐标", "象限", "点"], "coordinate", "model.html?id=coordinate-system")
        ]
      },
      {
        grade: "八年级",
        topics: [
          topic("triangle", "三角形", "初中数学", "图形与几何", ["底", "高", "面积"], "triangle", "model.html?id=triangle"),
          topic("congruent-triangle", "全等三角形", "初中数学", "图形与几何", ["SSS", "SAS", "ASA"], "congruence", "model.html?id=congruent-triangle"),
          topic("symmetry", "轴对称", "初中数学", "图形与几何", ["对称轴", "距离"], "symmetry", "model.html?id=symmetry"),
          topic("pythagorean-theorem", "勾股定理", "初中数学", "图形与几何", ["直角三角形", "平方"], "pythagorean", "model.html?id=pythagorean-theorem"),
          topic("linear-function", "一次函数", "初中数学", "函数", ["斜率", "截距", "图像"], "linear-function", "model.html?id=linear-function")
        ]
      },
      {
        grade: "九年级",
        topics: [
          topic("quadratic-equation", "一元二次方程", "初中数学", "数与代数", ["因式分解", "公式法"], "quadratic-equation", "model.html?id=quadratic-equation"),
          topic("quadratic-function", "二次函数", "初中数学", "函数", ["抛物线", "顶点", "对称轴"], "quadratic-function", "model.html?id=quadratic-function"),
          topic("similar-triangle", "相似三角形", "初中数学", "图形与几何", ["比例", "对应边"], "similarity", "model.html?id=similar-triangle"),
          topic("trigonometry", "锐角三角函数", "初中数学", "图形与几何", ["sin", "cos", "tan"], "trigonometry", "model.html?id=trigonometry"),
          topic("probability", "概率初步", "初中数学", "统计与概率", ["随机事件", "频率"], "probability", "model.html?id=probability")
        ]
      }
    ]
  };

  let currentSection = "primary";
  let selectedGrade = {
    primary: TOPIC_GROUPS.primary[0].grade,
    junior: TOPIC_GROUPS.junior[0].grade
  };
  let selectedTopic = null;
  let currentMode = "basic";
  let currentQuestion = null;
  let currentResult = null;
  let isLoadingQuestion = false;

  function topic(id, title, stageLabel, domain, tags, generator, detailHref = "") {
    return { id, title, stageLabel, domain, tags, generator, detailHref };
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function choice(items) {
    return items[randomInt(0, items.length - 1)];
  }

  function round(value, digits = 2) {
    return Number(value).toFixed(digits).replace(/\.?0+$/, "");
  }

  function todayKey() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }

  function yesterdayKey() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function emptyProgress() {
    return {
      stars: 0,
      streak: 0,
      lastStudyDate: "",
      todayDate: todayKey(),
      todayCount: 0,
      total: 0,
      correct: 0,
      wrong: 0,
      topics: {}
    };
  }

  function getProgress() {
    const progress = loadJson(STORAGE.progress, emptyProgress());
    if (progress.todayDate !== todayKey()) {
      progress.todayDate = todayKey();
      progress.todayCount = 0;
    }
    progress.topics = progress.topics || {};
    return { ...emptyProgress(), ...progress, topics: progress.topics };
  }

  function saveProgress(progress) {
    saveJson(STORAGE.progress, progress);
    renderStatus();
  }

  function getMistakes() {
    return loadJson(STORAGE.mistakes, []);
  }

  function saveMistakes(mistakes) {
    saveJson(STORAGE.mistakes, mistakes);
  }

  function getHistory() {
    return loadJson(STORAGE.history, []);
  }

  function saveHistory(history) {
    saveJson(STORAGE.history, history.slice(-300));
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizedText(value) {
    return String(value ?? "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[，。！？、,.!?]/g, "");
  }

  function extractNumbers(value) {
    const matches = String(value ?? "").match(/-?\d+(?:\.\d+)?/g);
    return matches ? matches.map(Number).filter((item) => Number.isFinite(item)) : [];
  }

  function topicStats(topicId) {
    const progress = getProgress();
    const stats = progress.topics[topicId] || { total: 0, correct: 0, wrong: 0, mastery: 0 };
    const mastery = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return { ...stats, mastery };
  }

  function renderStatus() {
    const progress = getProgress();
    const accuracy = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
    statusBar.innerHTML = `
      <span>连续 ${progress.streak || 0} 天</span>
      <span>星星 ${progress.stars || 0}</span>
      <span>掌握度 ${accuracy}%</span>
      <span>今日 ${progress.todayCount || 0} 题</span>
    `;
  }

  function setActiveNav(section) {
    navButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.section === section);
    });
  }

  function render() {
    setActiveNav(currentSection);
    renderStatus();

    if (currentSection === "photo") {
      renderPhotoHelper();
      return;
    }

    if (currentSection === "mistakes") {
      renderMistakes();
      return;
    }

    if (currentSection === "report") {
      renderReport();
      return;
    }

    if (selectedTopic) {
      renderTopicPractice(selectedTopic);
      return;
    }

    renderKnowledgeMap(currentSection);
  }

  function renderKnowledgeMap(stage) {
    const groups = TOPIC_GROUPS[stage];
    const title = stage === "primary" ? "小学数学" : "初中数学";
    const currentGrade = selectedGrade[stage];
    const gradeGroup = groups.find((group) => group.grade === currentGrade) || groups[0];

    app.innerHTML = `
      <section class="trainer-panel">
        <div class="trainer-section-head">
          <div>
            <p class="trainer-kicker">知识点地图</p>
            <h2>${title}</h2>
          </div>
          <p>先选年级，再进入知识点闯关。</p>
        </div>
        <div class="grade-tabs">
          ${groups.map((group) => `
            <button type="button" class="${group.grade === gradeGroup.grade ? "active" : ""}" data-grade="${escapeHTML(group.grade)}">${group.grade}</button>
          `).join("")}
        </div>
        <div class="knowledge-grid">
          ${gradeGroup.topics.map((item) => topicCard(item, gradeGroup.grade)).join("")}
        </div>
      </section>
    `;

    app.querySelectorAll("[data-grade]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedGrade[stage] = button.dataset.grade;
        renderKnowledgeMap(stage);
      });
    });

    app.querySelectorAll("[data-topic]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedTopic = findTopic(button.dataset.topic);
        currentQuestion = null;
        currentResult = null;
        render();
      });
    });
  }

  function topicCard(item, grade) {
    const stats = topicStats(item.id);
    const tags = item.tags.slice(0, 3).map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
    return `
      <button type="button" class="knowledge-card" data-topic="${escapeHTML(item.id)}">
        <span class="knowledge-title">${escapeHTML(item.title)}</span>
        <span class="knowledge-meta">${escapeHTML(grade)} · ${escapeHTML(item.domain)}</span>
        <span class="knowledge-tags">${tags}</span>
        <span class="mastery-line"><i style="width:${stats.mastery}%"></i></span>
        <span class="mastery-text">掌握度 ${stats.mastery}%</span>
      </button>
    `;
  }

  function findTopic(topicId) {
    return Object.values(TOPIC_GROUPS)
      .flat()
      .flatMap((group) => group.topics.map((item) => ({ ...item, grade: group.grade })))
      .find((item) => item.id === topicId);
  }

  function renderTopicPractice(topicItem) {
    const stats = topicStats(topicItem.id);
    app.innerHTML = `
      <section class="trainer-panel topic-panel">
        <button type="button" class="text-button back-to-map">返回知识点地图</button>
        <div class="topic-head">
          <div>
            <p class="trainer-kicker">${escapeHTML(topicItem.stageLabel)} · ${escapeHTML(topicItem.grade)} · ${escapeHTML(topicItem.domain)}</p>
            <h2>${escapeHTML(topicItem.title)}</h2>
            <div class="knowledge-tags inline-tags">${topicItem.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}</div>
          </div>
          <div class="topic-score">
            <strong>${stats.mastery}%</strong>
            <span>掌握度</span>
          </div>
        </div>

        <div class="mode-grid" aria-label="练习模式">
          ${Object.keys(MODE_LABELS).map((mode) => `
            <button type="button" class="mode-card ${mode === currentMode ? "active" : ""}" data-mode="${mode}">
              <span>${MODE_LABELS[mode]}</span>
              <small>${MODE_HINTS[mode]}</small>
            </button>
          `).join("")}
        </div>

        <div class="practice-layout">
          <section class="practice-card">
            <div class="practice-card-head">
              <div>
                <p class="trainer-kicker">${MODE_LABELS[currentMode]}</p>
                <h3>本轮练习</h3>
              </div>
              <button type="button" class="primary-button compact" id="newQuestionButton">${isLoadingQuestion ? "生成中..." : "生成题目"}</button>
            </div>
            <div id="questionArea">
              ${renderQuestionArea()}
            </div>
          </section>
          <aside class="coach-side-card">
            <h3>陪练目标</h3>
            <p>题目会记录年级、知识点、题型、难度和错因。做错后会给同类变式，帮助你把同一个坑补上。</p>
            ${topicItem.detailHref ? `<a href="${escapeHTML(topicItem.detailHref)}" class="secondary-link">打开互动课件</a>` : ""}
          </aside>
        </div>
      </section>
    `;

    app.querySelector(".back-to-map").addEventListener("click", () => {
      selectedTopic = null;
      currentQuestion = null;
      currentResult = null;
      render();
    });

    app.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", async () => {
        currentMode = button.dataset.mode;
        await startQuestion(topicItem, currentMode);
      });
    });

    app.querySelector("#newQuestionButton").addEventListener("click", () => startQuestion(topicItem, currentMode));
    bindQuestionEvents(topicItem);
  }

  function renderQuestionArea() {
    if (isLoadingQuestion) {
      return `<div class="empty-practice">正在生成一道新的变式题...</div>`;
    }

    if (!currentQuestion) {
      return `<div class="empty-practice">选择练习模式或点击“生成题目”，开始本知识点陪练。</div>`;
    }

    return `
      <article class="question-box">
        <div class="question-meta-row">
          <span>${escapeHTML(currentQuestion.grade)}</span>
          <span>${escapeHTML(currentQuestion.knowledge)}</span>
          <span>${escapeHTML(currentQuestion.type)}</span>
          <span>${escapeHTML(currentQuestion.difficulty)}</span>
        </div>
        <h4>题目</h4>
        <p>${escapeHTML(currentQuestion.question)}</p>
      </article>
      <label class="answer-label" for="trainerAnswer">你的答案</label>
      <div class="answer-row">
        <input id="trainerAnswer" type="text" autocomplete="off" placeholder="例如：24、24平方厘米、x=4" />
        <button type="button" class="primary-button" id="submitAnswerButton">提交答案</button>
      </div>
      <div id="gradeResult">${currentResult ? renderGradeResult(currentResult) : ""}</div>
    `;
  }

  function bindQuestionEvents(topicItem) {
    const submitButton = app.querySelector("#submitAnswerButton");
    if (!submitButton) {
      return;
    }

    submitButton.addEventListener("click", () => {
      const input = app.querySelector("#trainerAnswer");
      const userAnswer = input ? input.value.trim() : "";
      if (!currentQuestion) {
        showInlineMessage("请先生成题目。");
        return;
      }
      if (!userAnswer) {
        showInlineMessage("请先填写你的答案。");
        return;
      }
      currentResult = gradeCurrentQuestion(userAnswer);
      recordAttempt(topicItem, currentQuestion, userAnswer, currentResult);
      const result = app.querySelector("#gradeResult");
      if (result) {
        result.innerHTML = renderGradeResult(currentResult);
      }
      renderStatus();
    });
  }

  function showInlineMessage(message) {
    const result = app.querySelector("#gradeResult");
    if (result) {
      result.innerHTML = `<div class="grade-result warning">${escapeHTML(message)}</div>`;
    }
  }

  async function startQuestion(topicItem, mode) {
    currentMode = mode;
    currentQuestion = null;
    currentResult = null;
    isLoadingQuestion = true;
    renderTopicPractice(topicItem);

    const localQuestion = generateLocalQuestion(topicItem, mode);
    let question = localQuestion;

    if (mode === "ai") {
      question = await generateAiVariant(topicItem, localQuestion);
    }

    currentQuestion = question;
    currentResult = null;
    isLoadingQuestion = false;
    renderTopicPractice(topicItem);
  }

  async function generateAiVariant(topicItem, localQuestion) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch("/api/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: topicItem.id,
            grade: topicItem.grade,
            domain: topicItem.domain,
            localQuestion: {
              question: localQuestion.question,
              answer: localQuestion.answer,
              answerValue: localQuestion.answerValue,
              aliases: localQuestion.aliases,
              steps: localQuestion.steps.map((step) => step.content || step),
              explanation: localQuestion.explanation,
              type: localQuestion.type,
              variantStyle: localQuestion.variantStyle
            }
          })
        });
        const data = await response.json();
        const normalized = normalizeQuestion(data, topicItem, "AI随机", localQuestion);
        if (normalized.question && normalized.answer) {
          return normalized;
        }
      } catch (error) {
        // Try once more, then use the local seed.
      }
    }

    return {
      ...localQuestion,
      difficulty: "AI随机",
      type: `${localQuestion.type}变式`
    };
  }

  function normalizeQuestion(data, topicItem, difficulty, fallback) {
    const steps = Array.isArray(data?.steps) && data.steps.length > 0
      ? data.steps.map((step, index) => ({
          title: `步骤${index + 1}`,
          content: String(step || "").trim(),
          explain: index === 0 ? "先读懂条件，再选择对应方法。" : "保持每一步都有依据。"
        })).filter((step) => step.content)
      : fallback.steps;

    const answer = String(data?.answer || "").trim();
    const answerValue = data?.answerValue ?? fallback.answerValue ?? extractNumbers(answer)[0];
    return {
      ...fallback,
      id: `q_${Date.now()}_${randomInt(1000, 9999)}`,
      grade: topicItem.grade,
      knowledgeId: topicItem.id,
      knowledge: topicItem.title,
      type: String(data?.type || fallback.type || "变式题").trim(),
      difficulty,
      question: String(data?.question || "").trim(),
      answer,
      answerValue,
      aliases: Array.isArray(data?.aliases) ? data.aliases : fallback.aliases,
      steps,
      explanation: String(data?.explanation || fallback.explanation || "").trim(),
      errorTags: fallback.errorTags,
      commonMistake: fallback.commonMistake,
      variantStyle: fallback.variantStyle
    };
  }

  function baseQuestion(topicItem, mode, partial) {
    const difficulty = MODE_LABELS[mode] || "基础练习";
    const variantStyle = mode === "ai"
      ? choice(["同语义变式", "反向提问", "生活化应用题"])
      : mode === "advanced"
        ? choice(["反向提问", "条件变化"])
        : mode === "mistake"
          ? "易错辨析"
          : "核心题型";

    return {
      id: `q_${Date.now()}_${randomInt(1000, 9999)}`,
      grade: topicItem.grade,
      stage: topicItem.stageLabel,
      knowledgeId: topicItem.id,
      knowledge: topicItem.title,
      type: partial.type || "计算题",
      difficulty,
      question: partial.question,
      answer: partial.answer,
      answerValue: partial.answerValue,
      aliases: partial.aliases || [],
      steps: partial.steps || [],
      explanation: partial.explanation || "",
      errorTags: partial.errorTags || ["方法选择"],
      commonMistake: partial.commonMistake || "只看数字，不看题目要求。",
      variantStyle
    };
  }

  function generateLocalQuestion(topicItem, mode) {
    const generators = {
      "arithmetic-small": genArithmeticSmall,
      "compare-number": genCompareNumber,
      "shape-recognition": genShapeRecognition,
      "data-count": genDataCount,
      multiplication: genMultiplication,
      division: genDivision,
      "unit-length": genUnitLength,
      "angle-basic": genAngleBasic,
      "multi-operation": genMultiOperation,
      "fraction-basic": genFractionBasic,
      perimeter: genPerimeter,
      "place-value": genPlaceValue,
      decimal: genDecimal,
      quadrilateral: genQuadrilateral,
      "smart-calc": genSmartCalc,
      "decimal-operation": genDecimalOperation,
      "fraction-add": genFractionAdd,
      cuboid: genCuboid,
      "equation-basic": genEquationBasic,
      "fraction-operation": genFractionOperation,
      ratio: genRatio,
      circle: genCircle,
      percent: genPercent,
      "signed-number": genSignedNumber,
      "like-terms": genLikeTerms,
      "linear-equation": genLinearEquation,
      "geometry-basic": genGeometryBasic,
      coordinate: genCoordinate,
      triangle: genTriangle,
      congruence: genCongruence,
      symmetry: genSymmetry,
      pythagorean: genPythagorean,
      "linear-function": genLinearFunction,
      "quadratic-equation": genQuadraticEquation,
      "quadratic-function": genQuadraticFunction,
      similarity: genSimilarity,
      trigonometry: genTrigonometry,
      probability: genProbability
    };

    const generator = generators[topicItem.generator] || genFallback;
    return generator(topicItem, mode);
  }

  function genArithmeticSmall(topicItem, mode) {
    const a = randomInt(5, 18);
    const b = randomInt(1, Math.min(9, a));
    const c = randomInt(1, 8);
    if (mode === "advanced") {
      const answer = a - b + c;
      return baseQuestion(topicItem, mode, {
        type: "连加连减",
        question: `先算 ${a} - ${b}，再加 ${c}，结果是多少？`,
        answer: String(answer),
        answerValue: answer,
        steps: stepList([`先算 ${a} - ${b} = ${a - b}`, `再算 ${a - b} + ${c} = ${answer}`]),
        explanation: "连加连减要按顺序算，也可以先看有没有更方便的组合。",
        errorTags: ["运算顺序", "加减混淆"]
      });
    }
    const answer = a + b;
    return baseQuestion(topicItem, mode, {
      type: "加法计算",
      question: `小林有 ${a} 张贴纸，又得到 ${b} 张，现在一共有多少张？`,
      answer: String(answer),
      answerValue: answer,
      steps: stepList([`把已有的 ${a} 张和新得到的 ${b} 张合起来`, `${a} + ${b} = ${answer}`]),
      explanation: "求一共多少，用加法。",
      errorTags: ["加法意义", "数数错误"]
    });
  }

  function genCompareNumber(topicItem, mode) {
    const a = randomInt(10, 99);
    let b = randomInt(10, 99);
    if (b === a) b += 1;
    const answer = a > b ? `${a} 大` : `${b} 大`;
    return baseQuestion(topicItem, mode, {
      type: "比较大小",
      question: `比较 ${a} 和 ${b}，哪个数更大？`,
      answer,
      aliases: [String(Math.max(a, b)), answer],
      answerValue: Math.max(a, b),
      steps: stepList(["先比较十位", "十位相同再比较个位", `更大的数是 ${Math.max(a, b)}`]),
      explanation: "两位数比较大小，先看十位，再看个位。",
      errorTags: ["位值理解", "比较顺序"]
    });
  }

  function genShapeRecognition(topicItem, mode) {
    const shapes = [
      ["正方形", "四条边一样长，四个角都是直角"],
      ["长方形", "对边相等，四个角都是直角"],
      ["圆", "没有角，边是弯曲的"]
    ];
    const selected = choice(shapes);
    return baseQuestion(topicItem, mode, {
      type: "图形识别",
      question: `有一个图形：${selected[1]}。它最可能是什么图形？`,
      answer: selected[0],
      aliases: [selected[0]],
      steps: stepList(["抓住边和角的特征", `这个特征对应 ${selected[0]}`]),
      explanation: "认识图形时要看边、角和是否有曲线。",
      errorTags: ["图形特征", "概念混淆"]
    });
  }

  function genDataCount(topicItem, mode) {
    const red = randomInt(4, 12);
    const blue = randomInt(3, 10);
    const answer = red + blue;
    return baseQuestion(topicItem, mode, {
      type: "数据整理",
      question: `统计表中红球有 ${red} 个，蓝球有 ${blue} 个。两种球一共有多少个？`,
      answer: String(answer),
      answerValue: answer,
      steps: stepList([`红球 ${red} 个，蓝球 ${blue} 个`, `${red} + ${blue} = ${answer}`]),
      explanation: "把同一类统计对象的数量合起来，用加法。",
      errorTags: ["数据读取", "加法计算"]
    });
  }

  function genMultiplication(topicItem, mode) {
    const a = randomInt(2, 9);
    const b = randomInt(2, 9);
    const answer = a * b;
    return baseQuestion(topicItem, mode, {
      type: "乘法意义",
      question: `每组有 ${a} 个苹果，共有 ${b} 组，一共有多少个苹果？`,
      answer: String(answer),
      answerValue: answer,
      steps: stepList([`这是 ${b} 个 ${a} 相加`, `${a} × ${b} = ${answer}`]),
      explanation: "求几个相同加数的和，可以用乘法。",
      errorTags: ["乘法口诀", "数量关系"]
    });
  }

  function genDivision(topicItem, mode) {
    const group = randomInt(2, 9);
    const count = randomInt(2, 9);
    const total = group * count;
    return baseQuestion(topicItem, mode, {
      type: "平均分",
      question: `${total} 个橘子平均分给 ${group} 个小朋友，每人分到几个？`,
      answer: String(count),
      answerValue: count,
      steps: stepList([`平均分用除法`, `${total} ÷ ${group} = ${count}`]),
      explanation: "已知总数和份数，求每份多少，用除法。",
      errorTags: ["除法意义", "口诀逆用"]
    });
  }

  function genUnitLength(topicItem, mode) {
    const meters = randomInt(2, 9);
    const cm = meters * 100;
    return baseQuestion(topicItem, mode, {
      type: "单位换算",
      question: `${meters} 米等于多少厘米？`,
      answer: `${cm}厘米`,
      answerValue: cm,
      aliases: [String(cm), `${cm}cm`],
      steps: stepList(["1 米 = 100 厘米", `${meters} 米 = ${meters} × 100 = ${cm} 厘米`]),
      explanation: "长度单位换算要先记住 1 米等于 100 厘米。",
      errorTags: ["单位换算", "倍数关系"]
    });
  }

  function genAngleBasic(topicItem, mode) {
    const angle = choice([30, 45, 60, 90, 120]);
    const answer = angle === 90 ? "直角" : angle < 90 ? "锐角" : "钝角";
    return baseQuestion(topicItem, mode, {
      type: "角的分类",
      question: `一个角是 ${angle}°，它是锐角、直角还是钝角？`,
      answer,
      aliases: [answer],
      steps: stepList(["小于 90° 是锐角", "等于 90° 是直角", "大于 90° 是钝角"]),
      explanation: `${angle}° 对应 ${answer}。`,
      errorTags: ["角度分类", "90度标准"]
    });
  }

  function genMultiOperation(topicItem, mode) {
    const a = randomInt(12, 35);
    const b = randomInt(3, 8);
    const answer = a * b;
    return baseQuestion(topicItem, mode, {
      type: "两位数乘一位数",
      question: `学校买了 ${b} 盒彩笔，每盒 ${a} 支，一共买了多少支？`,
      answer: String(answer),
      answerValue: answer,
      steps: stepList([`列式 ${a} × ${b}`, `先算 ${a} 个 ${b}，结果是 ${answer}`]),
      explanation: "相同数量重复出现，用乘法。",
      errorTags: ["竖式计算", "进位错误"]
    });
  }

  function genFractionBasic(topicItem, mode) {
    const denominator = choice([3, 4, 5, 6, 8]);
    const numerator = randomInt(1, denominator - 1);
    return baseQuestion(topicItem, mode, {
      type: "分数意义",
      question: `把一个蛋糕平均分成 ${denominator} 份，取其中 ${numerator} 份，用分数怎样表示？`,
      answer: `${numerator}/${denominator}`,
      aliases: [`${numerator}分之${denominator}`, `${denominator}分之${numerator}`],
      steps: stepList(["平均分成几份，分母就是几", "取几份，分子就是几", `表示为 ${numerator}/${denominator}`]),
      explanation: "分数表示把整体平均分后取其中的几份。",
      errorTags: ["分子分母", "平均分"]
    });
  }

  function genPerimeter(topicItem, mode) {
    const length = randomInt(5, 15);
    const width = randomInt(2, 9);
    const answer = 2 * (length + width);
    return baseQuestion(topicItem, mode, {
      type: "长方形周长",
      question: `一个长方形长 ${length} 厘米，宽 ${width} 厘米，周长是多少厘米？`,
      answer: `${answer}厘米`,
      answerValue: answer,
      aliases: [String(answer)],
      steps: stepList(["长方形周长 = (长 + 宽) × 2", `(${length} + ${width}) × 2 = ${answer}`]),
      explanation: "周长是围成图形一圈的长度。",
      errorTags: ["周长公式", "漏乘2"]
    });
  }

  function genPlaceValue(topicItem, mode) {
    const number = randomInt(10000, 99999);
    const thousands = Math.floor(number / 1000) % 10;
    return baseQuestion(topicItem, mode, {
      type: "数位认识",
      question: `在 ${number} 中，千位上的数字是几？`,
      answer: String(thousands),
      answerValue: thousands,
      steps: stepList(["从右往左依次是个位、十位、百位、千位", `千位上的数字是 ${thousands}`]),
      explanation: "大数读写要先找准数位。",
      errorTags: ["数位顺序", "读数错误"]
    });
  }

  function genDecimal(topicItem, mode) {
    const tenths = randomInt(1, 9);
    return baseQuestion(topicItem, mode, {
      type: "小数意义",
      question: `0.${tenths} 表示十分之几？`,
      answer: `${tenths}/10`,
      aliases: [`十分之${tenths}`],
      steps: stepList(["一位小数表示十分之几", `0.${tenths} = ${tenths}/10`]),
      explanation: "小数和分数可以互相表示。",
      errorTags: ["小数位数", "分数意义"]
    });
  }

  function genQuadrilateral(topicItem, mode) {
    const base = randomInt(6, 14);
    const height = randomInt(3, 9);
    const answer = base * height;
    return baseQuestion(topicItem, mode, {
      type: "平行四边形面积",
      question: `一个平行四边形的底是 ${base} 厘米，高是 ${height} 厘米，面积是多少平方厘米？`,
      answer: `${answer}平方厘米`,
      answerValue: answer,
      aliases: [String(answer)],
      steps: stepList(["平行四边形面积 = 底 × 高", `${base} × ${height} = ${answer}`]),
      explanation: "底和高必须对应，不能把斜边当高。",
      errorTags: ["底高对应", "面积公式"]
    });
  }

  function genSmartCalc(topicItem, mode) {
    const a = randomInt(12, 38);
    const b = 100 - a;
    const c = randomInt(5, 40);
    const answer = a + b + c;
    return baseQuestion(topicItem, mode, {
      type: "简便运算",
      question: `计算 ${a} + ${c} + ${b}，怎样更简便？结果是多少？`,
      answer: String(answer),
      answerValue: answer,
      steps: stepList([`先把 ${a} 和 ${b} 凑成 100`, `100 + ${c} = ${answer}`]),
      explanation: "利用加法交换律和结合律，可以先凑整。",
      errorTags: ["凑整意识", "运算律"]
    });
  }

  function genDecimalOperation(topicItem, mode) {
    const a = randomInt(12, 45) / 10;
    const b = randomInt(2, 9);
    const answer = round(a * b);
    return baseQuestion(topicItem, mode, {
      type: "小数乘法",
      question: `每米彩带 ${a} 元，买 ${b} 米需要多少元？`,
      answer: `${answer}元`,
      answerValue: Number(answer),
      aliases: [String(answer)],
      steps: stepList([`列式 ${a} × ${b}`, `计算得 ${answer}`]),
      explanation: "小数乘法可以先按整数算，再处理小数点。",
      errorTags: ["小数点位置", "乘法意义"]
    });
  }

  function genFractionAdd(topicItem, mode) {
    const denominator = choice([6, 8, 10, 12]);
    const a = randomInt(1, Math.floor(denominator / 2));
    const b = randomInt(1, Math.floor(denominator / 2));
    const sum = a + b;
    return baseQuestion(topicItem, mode, {
      type: "同分母分数加法",
      question: `计算 ${a}/${denominator} + ${b}/${denominator}。`,
      answer: `${sum}/${denominator}`,
      aliases: [`${denominator}分之${sum}`],
      steps: stepList(["同分母分数相加，分母不变", `分子相加：${a} + ${b} = ${sum}`, `结果是 ${sum}/${denominator}`]),
      explanation: "同分母分数加减，只处理分子。",
      errorTags: ["分母不变", "通分约分"]
    });
  }

  function genCuboid(topicItem, mode) {
    const l = randomInt(3, 8);
    const w = randomInt(2, 6);
    const h = randomInt(2, 5);
    const answer = l * w * h;
    return baseQuestion(topicItem, mode, {
      type: "长方体体积",
      question: `一个长方体长 ${l} 厘米，宽 ${w} 厘米，高 ${h} 厘米，体积是多少立方厘米？`,
      answer: `${answer}立方厘米`,
      answerValue: answer,
      aliases: [String(answer)],
      steps: stepList(["长方体体积 = 长 × 宽 × 高", `${l} × ${w} × ${h} = ${answer}`]),
      explanation: "体积表示物体占空间的大小。",
      errorTags: ["体积公式", "单位错误"]
    });
  }

  function genEquationBasic(topicItem, mode) {
    return genLinearEquation(topicItem, mode, true);
  }

  function genFractionOperation(topicItem, mode) {
    const denominator = choice([3, 4, 5, 6]);
    const multiplier = randomInt(2, 8);
    return baseQuestion(topicItem, mode, {
      type: "分数乘法",
      question: `${multiplier} 的 ${1}/${denominator} 是多少？`,
      answer: `${round(multiplier / denominator)}`,
      answerValue: multiplier / denominator,
      steps: stepList([`求一个数的几分之几，用乘法`, `${multiplier} × 1/${denominator} = ${round(multiplier / denominator)}`]),
      explanation: "把整体平均分成若干份，再取其中一份。",
      errorTags: ["单位1", "分数乘法"]
    });
  }

  function genRatio(topicItem, mode) {
    const a = randomInt(2, 8);
    const b = randomInt(2, 8);
    const scale = randomInt(2, 5);
    return baseQuestion(topicItem, mode, {
      type: "比例关系",
      question: `甲、乙两数的比是 ${a}:${b}。如果甲数是 ${a * scale}，乙数是多少？`,
      answer: String(b * scale),
      answerValue: b * scale,
      steps: stepList([`甲从 ${a} 变成 ${a * scale}，扩大 ${scale} 倍`, `乙也扩大 ${scale} 倍：${b} × ${scale} = ${b * scale}`]),
      explanation: "比例关系中，对应量要按同一个倍数变化。",
      errorTags: ["对应关系", "倍数"]
    });
  }

  function genCircle(topicItem, mode) {
    const r = randomInt(2, 10);
    const askArea = mode !== "basic" ? Math.random() > 0.45 : true;
    const answer = askArea ? round(3.14 * r * r) : round(2 * 3.14 * r);
    return baseQuestion(topicItem, mode, {
      type: askArea ? "圆面积" : "圆周长",
      question: `一个圆的半径是 ${r} 厘米，求它的${askArea ? "面积" : "周长"}。`,
      answer: `${answer}${askArea ? "平方厘米" : "厘米"}`,
      answerValue: Number(answer),
      aliases: [String(answer)],
      steps: stepList(askArea ? ["圆面积 = πr²", `3.14 × ${r} × ${r} = ${answer}`] : ["圆周长 = 2πr", `2 × 3.14 × ${r} = ${answer}`]),
      explanation: askArea ? "面积和半径的平方有关。" : "周长是绕圆一圈的长度。",
      errorTags: ["圆公式", "平方关系"]
    });
  }

  function genPercent(topicItem, mode) {
    const total = choice([50, 80, 100, 120, 200]);
    const rate = choice([10, 20, 25, 40, 60]);
    const answer = round((total * rate) / 100);
    return baseQuestion(topicItem, mode, {
      type: "百分数应用",
      question: `${total} 元商品打 ${rate}% 的折扣，便宜了多少元？`,
      answer: `${answer}元`,
      answerValue: Number(answer),
      aliases: [String(answer)],
      steps: stepList([`${rate}% = ${rate}/100`, `${total} × ${rate}% = ${answer}`]),
      explanation: "求一个数的百分之几，用乘法。",
      errorTags: ["百分数意义", "小数转化"]
    });
  }

  function genSignedNumber(topicItem, mode) {
    const a = randomInt(3, 12);
    const b = randomInt(2, 10);
    const answer = -a + b;
    return baseQuestion(topicItem, mode, {
      type: "有理数加法",
      question: `气温上午是 -${a}℃，中午上升 ${b}℃，中午气温是多少？`,
      answer: `${answer}℃`,
      answerValue: answer,
      aliases: [String(answer)],
      steps: stepList([`列式 -${a} + ${b}`, `异号相加，用较大绝对值减较小绝对值`, `结果是 ${answer}℃`]),
      explanation: "正负数加法要同时看符号和绝对值。",
      errorTags: ["符号错误", "绝对值"]
    });
  }

  function genLikeTerms(topicItem, mode) {
    const a = randomInt(2, 8);
    const b = randomInt(2, 7);
    const c = randomInt(1, 9);
    const d = randomInt(1, 6);
    const answer = `${a + b}x + ${c - d}`;
    return baseQuestion(topicItem, mode, {
      type: "合并同类项",
      question: `化简：${a}x + ${c} + ${b}x - ${d}`,
      answer,
      aliases: [`${a + b}x+${c - d}`, `${a + b}x${c - d >= 0 ? "+" : ""}${c - d}`],
      steps: stepList([`把 x 项放一起：${a}x + ${b}x`, `常数项放一起：${c} - ${d}`, `结果是 ${answer}`]),
      explanation: "只有字母和指数都相同的项才能合并。",
      errorTags: ["同类项识别", "符号处理"],
      commonMistake: "把 x 项和常数项合并，或漏掉减号。"
    });
  }

  function genLinearEquation(topicItem, mode, simple = false) {
    const a = randomInt(2, simple ? 5 : 7);
    const x = randomInt(2, 9);
    const b = randomInt(1, 12);
    const c = a * x + b;
    return baseQuestion(topicItem, mode, {
      type: "解方程",
      question: `解方程：${a}x + ${b} = ${c}`,
      answer: `x=${x}`,
      answerValue: x,
      aliases: [String(x), `x = ${x}`],
      steps: stepList([`两边同时减 ${b}：${a}x = ${c - b}`, `两边同时除以 ${a}：x = ${x}`]),
      explanation: "解方程要保持等式两边同时做相同操作。",
      errorTags: ["等式性质", "移项变号"],
      commonMistake: "只移动一边的数，忘记等式两边要同步变化。"
    });
  }

  function genGeometryBasic(topicItem, mode) {
    const options = [
      ["线段", "有两个端点，可以测量长度"],
      ["射线", "有一个端点，向一方无限延伸"],
      ["直线", "没有端点，向两方无限延伸"]
    ];
    const selected = choice(options);
    return baseQuestion(topicItem, mode, {
      type: "几何概念辨析",
      question: `一种线有“${selected[1]}”的特点，它是什么？`,
      answer: selected[0],
      aliases: [selected[0]],
      steps: stepList(["先看端点个数", "再看能否延伸", `答案是 ${selected[0]}`]),
      explanation: "直线、射线、线段的关键区别是端点和延伸方向。",
      errorTags: ["概念混淆", "端点判断"]
    });
  }

  function genCoordinate(topicItem, mode) {
    const x = randomInt(-6, 6) || 2;
    const y = randomInt(-6, 6) || -3;
    const quadrant = x > 0 && y > 0 ? "第一象限" : x < 0 && y > 0 ? "第二象限" : x < 0 && y < 0 ? "第三象限" : "第四象限";
    return baseQuestion(topicItem, mode, {
      type: "象限判断",
      question: `点 P(${x}, ${y}) 在第几象限？`,
      answer: quadrant,
      aliases: [quadrant],
      steps: stepList(["先看 x 的正负", "再看 y 的正负", `点 P 在${quadrant}`]),
      explanation: "横坐标和纵坐标的正负决定象限。",
      errorTags: ["坐标顺序", "象限符号"]
    });
  }

  function genTriangle(topicItem, mode) {
    const base = randomInt(5, 16);
    const height = randomInt(4, 12);
    const answer = (base * height) / 2;
    return baseQuestion(topicItem, mode, {
      type: "三角形面积",
      question: `一个三角形底为 ${base} 厘米，高为 ${height} 厘米，面积是多少平方厘米？`,
      answer: `${round(answer)}平方厘米`,
      answerValue: answer,
      aliases: [String(round(answer))],
      steps: stepList(["三角形面积 = 底 × 高 ÷ 2", `${base} × ${height} ÷ 2 = ${round(answer)}`]),
      explanation: "三角形面积是同底同高平行四边形面积的一半。",
      errorTags: ["漏除以2", "底高对应"]
    });
  }

  function genCongruence(topicItem, mode) {
    const method = choice(["SSS", "SAS", "ASA", "AAS", "HL"]);
    return baseQuestion(topicItem, mode, {
      type: "全等判定",
      question: `两个三角形满足 ${method} 条件，可以判断它们全等吗？`,
      answer: "可以",
      aliases: ["能", "可以全等"],
      steps: stepList([`${method} 是常用全等判定方法`, "满足对应条件时可判定全等"]),
      explanation: "全等判定要看对应边和对应角。",
      errorTags: ["判定方法", "对应关系"]
    });
  }

  function genSymmetry(topicItem, mode) {
    const distance = randomInt(2, 10);
    return baseQuestion(topicItem, mode, {
      type: "轴对称性质",
      question: `点 A 到对称轴的距离是 ${distance} 厘米，它的对称点 A' 到对称轴的距离是多少厘米？`,
      answer: `${distance}厘米`,
      answerValue: distance,
      aliases: [String(distance)],
      steps: stepList(["轴对称点到对称轴的距离相等", `所以 A' 到对称轴也是 ${distance} 厘米`]),
      explanation: "对称轴是对应点连线的垂直平分线。",
      errorTags: ["对称距离", "性质记忆"]
    });
  }

  function genPythagorean(topicItem, mode) {
    const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]];
    const [a, b, c] = choice(triples);
    return baseQuestion(topicItem, mode, {
      type: "勾股定理",
      question: `直角三角形两条直角边分别为 ${a} 和 ${b}，斜边是多少？`,
      answer: String(c),
      answerValue: c,
      steps: stepList([`斜边² = ${a}² + ${b}²`, `${a * a} + ${b * b} = ${c * c}`, `斜边 = ${c}`]),
      explanation: "直角三角形中，两直角边平方和等于斜边平方。",
      errorTags: ["平方关系", "斜边判断"]
    });
  }

  function genLinearFunction(topicItem, mode) {
    const k = randomInt(-4, 5) || 2;
    const b = randomInt(-6, 6);
    const x = randomInt(-3, 5);
    const y = k * x + b;
    return baseQuestion(topicItem, mode, {
      type: "一次函数求值",
      question: `已知 y = ${k}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)}，当 x = ${x} 时，y 等于多少？`,
      answer: String(y),
      answerValue: y,
      steps: stepList([`把 x = ${x} 代入`, `y = ${k} × ${x} ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${y}`]),
      explanation: "函数求值就是把自变量代入解析式。",
      errorTags: ["代入计算", "符号处理"]
    });
  }

  function genQuadraticEquation(topicItem, mode) {
    const r1 = randomInt(1, 6);
    const r2 = randomInt(1, 6);
    const sum = r1 + r2;
    const product = r1 * r2;
    return baseQuestion(topicItem, mode, {
      type: "因式分解解方程",
      question: `解方程：x² - ${sum}x + ${product} = 0。`,
      answer: `x=${r1} 或 x=${r2}`,
      aliases: [`${r1},${r2}`, `${r2},${r1}`],
      steps: stepList([`分解为 (x - ${r1})(x - ${r2}) = 0`, `所以 x = ${r1} 或 x = ${r2}`]),
      explanation: "两个因式乘积为 0，则至少有一个因式为 0。",
      errorTags: ["因式分解", "漏解"]
    });
  }

  function genQuadraticFunction(topicItem, mode) {
    const a = choice([-2, -1, 1, 2]);
    const h = randomInt(-4, 4);
    const k = randomInt(-5, 5);
    const answer = `(${h}, ${k})`;
    return baseQuestion(topicItem, mode, {
      type: "抛物线顶点",
      question: `抛物线 y = ${a}(x ${h >= 0 ? "-" : "+"} ${Math.abs(h)})² ${k >= 0 ? "+" : "-"} ${Math.abs(k)} 的顶点坐标是什么？`,
      answer,
      aliases: [answer.replace(/\s+/g, "")],
      steps: stepList(["顶点式是 y = a(x - h)² + k", `读出 h = ${h}，k = ${k}`, `顶点是 (${h}, ${k})`]),
      explanation: "顶点式可以直接看出顶点坐标。",
      errorTags: ["顶点式", "符号相反"]
    });
  }

  function genSimilarity(topicItem, mode) {
    const ratio = randomInt(2, 5);
    const side = randomInt(3, 8);
    return baseQuestion(topicItem, mode, {
      type: "相似三角形比例",
      question: `两个三角形相似，对应边之比为 ${ratio}:1。小三角形一条边长 ${side} 厘米，大三角形对应边长多少厘米？`,
      answer: `${ratio * side}厘米`,
      answerValue: ratio * side,
      aliases: [String(ratio * side)],
      steps: stepList([`对应边按同一比例变化`, `${side} × ${ratio} = ${ratio * side}`]),
      explanation: "相似图形对应边成比例。",
      errorTags: ["对应边", "比例倍数"]
    });
  }

  function genTrigonometry(topicItem, mode) {
    const cases = [
      ["30°", "1/2"],
      ["45°", "√2/2"],
      ["60°", "√3/2"]
    ];
    const selected = choice(cases);
    return baseQuestion(topicItem, mode, {
      type: "特殊角三角函数",
      question: `sin ${selected[0]} 的值是多少？`,
      answer: selected[1],
      aliases: [selected[1], selected[1].replace("/", "÷")],
      steps: stepList(["回忆特殊角三角函数表", `sin ${selected[0]} = ${selected[1]}`]),
      explanation: "特殊角的三角函数值要熟练记忆。",
      errorTags: ["特殊角", "函数值混淆"]
    });
  }

  function genProbability(topicItem, mode) {
    const red = randomInt(2, 8);
    const white = randomInt(2, 8);
    const total = red + white;
    return baseQuestion(topicItem, mode, {
      type: "简单概率",
      question: `袋子里有 ${red} 个红球和 ${white} 个白球，随机摸出 1 个球，摸到红球的概率是多少？`,
      answer: `${red}/${total}`,
      aliases: [`${total}分之${red}`, round(red / total)],
      answerValue: red / total,
      steps: stepList([`总球数 = ${red} + ${white} = ${total}`, `红球概率 = 红球数 ÷ 总数 = ${red}/${total}`]),
      explanation: "等可能事件的概率 = 目标结果数 ÷ 所有可能结果数。",
      errorTags: ["总数遗漏", "概率公式"]
    });
  }

  function genFallback(topicItem, mode) {
    const a = randomInt(2, 12);
    const b = randomInt(2, 12);
    return baseQuestion(topicItem, mode, {
      type: "基础计算",
      question: `计算 ${a} + ${b}。`,
      answer: String(a + b),
      answerValue: a + b,
      steps: stepList([`${a} + ${b} = ${a + b}`]),
      explanation: "先根据题意列式，再计算。",
      errorTags: ["基础计算"]
    });
  }

  function stepList(contents) {
    return contents.map((content, index) => ({
      title: `步骤${index + 1}`,
      content,
      explain: index === 0 ? "先确定题目要求。" : "每一步都要和上一行相连。"
    }));
  }

  function gradeCurrentQuestion(userAnswer) {
    const question = currentQuestion;
    const userText = normalizedText(userAnswer);
    const answerText = normalizedText(question.answer);
    const aliases = (question.aliases || []).map(normalizedText);
    let correct = false;

    if (typeof question.answerValue === "number" && Number.isFinite(question.answerValue)) {
      const userNumbers = extractNumbers(userAnswer);
      correct = userNumbers.some((value) => Math.abs(value - Number(question.answerValue)) <= 0.01);
    }

    if (!correct) {
      correct = userText === answerText || aliases.some((alias) => alias && userText.includes(alias));
    }

    const cause = correct ? "思路正确，答案匹配。" : inferErrorCause(userAnswer, question);
    return {
      correct,
      userAnswer,
      cause,
      variant: generateLocalQuestion(findTopic(question.knowledgeId) || selectedTopic, "mistake")
    };
  }

  function inferErrorCause(userAnswer, question) {
    const numbers = extractNumbers(userAnswer);
    if (typeof question.answerValue === "number" && numbers.length === 0) {
      return "答案里没有可判断的数字，可能漏写了计算结果。";
    }
    if (typeof question.answerValue === "number" && numbers.length > 0) {
      return "数字结果不匹配，常见原因是公式代入、符号或单位处理错误。";
    }
    return "关键词或概念不完整，建议对照定义重新判断。";
  }

  function renderGradeResult(result) {
    const question = currentQuestion;
    const steps = (question.steps || []).map((step) => `
      <li>
        <strong>${escapeHTML(step.title || "步骤")}</strong>
        <span>${escapeHTML(step.content || step)}</span>
        ${step.explain ? `<small>${escapeHTML(step.explain)}</small>` : ""}
      </li>
    `).join("");

    return `
      <div class="grade-result ${result.correct ? "correct" : "wrong"}">
        <h4>${result.correct ? "判断结果：正确" : "判断结果：错误"}</h4>
        <div class="result-grid">
          <div>
            <span>正确答案</span>
            <strong>${escapeHTML(question.answer)}</strong>
          </div>
          <div>
            <span>错因分析</span>
            <strong>${escapeHTML(result.cause)}</strong>
          </div>
        </div>
        <div class="step-card">
          <h5>解题步骤</h5>
          <ol>${steps}</ol>
        </div>
        <p class="mistake-tip"><strong>易错点：</strong>${escapeHTML(question.commonMistake)}</p>
        <div class="variant-card">
          <h5>同类变式题</h5>
          <p>${escapeHTML(result.variant.question)}</p>
        </div>
      </div>
    `;
  }

  function recordAttempt(topicItem, question, userAnswer, result) {
    const progress = getProgress();
    const today = todayKey();
    if (progress.lastStudyDate !== today) {
      progress.streak = progress.lastStudyDate === yesterdayKey() ? (progress.streak || 0) + 1 : 1;
      progress.lastStudyDate = today;
    }
    progress.todayDate = today;
    progress.todayCount = (progress.todayCount || 0) + 1;
    progress.total = (progress.total || 0) + 1;
    progress.correct = (progress.correct || 0) + (result.correct ? 1 : 0);
    progress.wrong = (progress.wrong || 0) + (result.correct ? 0 : 1);
    progress.stars = (progress.stars || 0) + (result.correct ? 2 : 1);

    const stats = progress.topics[topicItem.id] || { total: 0, correct: 0, wrong: 0 };
    stats.total += 1;
    stats.correct += result.correct ? 1 : 0;
    stats.wrong += result.correct ? 0 : 1;
    stats.mastery = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    progress.topics[topicItem.id] = stats;
    saveProgress(progress);

    const record = {
      id: `attempt_${Date.now()}_${randomInt(1000, 9999)}`,
      time: new Date().toISOString(),
      grade: question.grade,
      knowledgeId: question.knowledgeId,
      knowledge: question.knowledge,
      type: question.type,
      difficulty: question.difficulty,
      question: question.question,
      userAnswer,
      answer: question.answer,
      explanation: question.explanation,
      steps: question.steps,
      errorTags: question.errorTags,
      correct: result.correct,
      cause: result.cause
    };

    saveHistory([...getHistory(), record]);

    if (!result.correct) {
      saveMistakes([record, ...getMistakes()].slice(0, 100));
    }
  }

  function renderPhotoHelper() {
    app.innerHTML = `
      <section class="trainer-panel photo-panel">
        <div class="trainer-section-head">
          <div>
            <p class="trainer-kicker">AI拍照讲题</p>
            <h2>拍照或粘贴题目，生成步骤讲解</h2>
          </div>
          <p>当前先支持图片入口和文字讲题，后续可接入视觉识别模型。</p>
        </div>
        <div class="photo-helper-grid">
          <label class="upload-box">
            <input id="photoInput" type="file" accept="image/*" />
            <span>选择题目图片</span>
            <small id="photoFileName">可拍照或上传截图</small>
          </label>
          <div class="photo-text-box">
            <label for="photoQuestion">题目文字</label>
            <textarea id="photoQuestion" rows="6" placeholder="也可以直接粘贴题目文字，例如：一个三角形底为12厘米，高为5厘米，求面积。"></textarea>
            <button type="button" class="primary-button" id="photoAskButton">生成步骤讲解</button>
          </div>
        </div>
        <div id="photoAnswer" class="ai-answer-box hidden"></div>
      </section>
    `;

    const input = app.querySelector("#photoInput");
    input.addEventListener("change", () => {
      const label = app.querySelector("#photoFileName");
      label.textContent = input.files?.[0]?.name || "可拍照或上传截图";
    });

    app.querySelector("#photoAskButton").addEventListener("click", handlePhotoAsk);
  }

  async function handlePhotoAsk() {
    const textarea = app.querySelector("#photoQuestion");
    const answerBox = app.querySelector("#photoAnswer");
    const text = textarea.value.trim();
    if (!text) {
      answerBox.classList.remove("hidden");
      answerBox.innerHTML = "请先粘贴题目文字，或在上传图片后补充题目内容。";
      return;
    }

    answerBox.classList.remove("hidden");
    answerBox.innerHTML = "正在生成步骤讲解...";
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `请按题目、答案、步骤、每一步解释、易错点、同类题的结构讲解：${text}`
        })
      });
      const data = await response.json();
      answerBox.innerHTML = formatPlainAnswer(data.answer || data.error || "暂时没有生成讲解。");
    } catch (error) {
      answerBox.innerHTML = "AI讲题暂时不可用，请稍后再试。";
    }
  }

  function formatPlainAnswer(value) {
    return escapeHTML(value)
      .replace(/\*\*/g, "")
      .replace(/```/g, "")
      .replace(/###/g, "")
      .replace(/\n/g, "<br>");
  }

  function renderMistakes() {
    const mistakes = getMistakes();
    app.innerHTML = `
      <section class="trainer-panel">
        <div class="trainer-section-head">
          <div>
            <p class="trainer-kicker">错题本</p>
            <h2>错因分析与变式重练</h2>
          </div>
          <button type="button" class="secondary-button" id="clearMistakesButton" ${mistakes.length ? "" : "disabled"}>清空错题</button>
        </div>
        ${mistakes.length ? `<div class="mistake-list">${mistakes.map(renderMistakeCard).join("")}</div>` : `<div class="empty-practice">还没有错题。做错后会自动记录到这里。</div>`}
      </section>
    `;

    const clearButton = app.querySelector("#clearMistakesButton");
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        if (confirm("确定要清空错题本吗？")) {
          saveMistakes([]);
          renderMistakes();
        }
      });
    }

    app.querySelectorAll("[data-review-topic]").forEach((button) => {
      button.addEventListener("click", async () => {
        const topicItem = findTopic(button.dataset.reviewTopic);
        if (!topicItem) return;
        currentSection = topicItem.stageLabel === "小学数学" ? "primary" : "junior";
        selectedGrade[currentSection] = topicItem.grade;
        selectedTopic = topicItem;
        await startQuestion(topicItem, "mistake");
      });
    });
  }

  function renderMistakeCard(item) {
    return `
      <article class="mistake-card">
        <div class="question-meta-row">
          <span>${escapeHTML(item.grade)}</span>
          <span>${escapeHTML(item.knowledge)}</span>
          <span>${escapeHTML(item.type)}</span>
          <span>${escapeHTML(item.difficulty)}</span>
        </div>
        <h3>${escapeHTML(item.question)}</h3>
        <p><strong>你的答案：</strong>${escapeHTML(item.userAnswer)}</p>
        <p><strong>正确答案：</strong>${escapeHTML(item.answer)}</p>
        <p><strong>错因：</strong>${escapeHTML(item.cause)}</p>
        <div class="knowledge-tags inline-tags">${(item.errorTags || []).map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}</div>
        <button type="button" class="secondary-button" data-review-topic="${escapeHTML(item.knowledgeId)}">再练一道变式题</button>
      </article>
    `;
  }

  function renderReport() {
    const progress = getProgress();
    const history = getHistory();
    const accuracy = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
    const topicRows = Object.entries(progress.topics || {})
      .map(([id, stats]) => {
        const topicItem = findTopic(id);
        const mastery = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        return { id, title: topicItem?.title || id, grade: topicItem?.grade || "", mastery, stats };
      })
      .sort((a, b) => b.stats.total - a.stats.total);

    app.innerHTML = `
      <section class="trainer-panel">
        <div class="trainer-section-head">
          <div>
            <p class="trainer-kicker">学习报告</p>
            <h2>闯关进度与掌握度</h2>
          </div>
          <p>用轻量积分记录连续学习、星级和知识点掌握度。</p>
        </div>
        <div class="report-grid">
          <div class="report-card"><strong>${progress.total || 0}</strong><span>总答题</span></div>
          <div class="report-card"><strong>${progress.correct || 0}</strong><span>答对</span></div>
          <div class="report-card"><strong>${accuracy}%</strong><span>正确率</span></div>
          <div class="report-card"><strong>${progress.stars || 0}</strong><span>星星</span></div>
        </div>
        <div class="report-list">
          ${topicRows.length ? topicRows.map((row) => `
            <div class="report-row">
              <div>
                <strong>${escapeHTML(row.title)}</strong>
                <span>${escapeHTML(row.grade)} · 已练 ${row.stats.total} 题</span>
              </div>
              <div class="report-progress"><i style="width:${row.mastery}%"></i></div>
              <b>${row.mastery}%</b>
            </div>
          `).join("") : `<div class="empty-practice">还没有练习记录，先去选择一个知识点吧。</div>`}
        </div>
        <p class="report-note">最近记录：${history.length} 条。错题会自动进入错题本，用于后续变式重练。</p>
      </section>
    `;
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentSection = button.dataset.section;
      selectedTopic = null;
      currentQuestion = null;
      currentResult = null;
      render();
    });
  });

  render();
})();
