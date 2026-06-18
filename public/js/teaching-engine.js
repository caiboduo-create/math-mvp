(function () {
  const CATEGORY_DEFAULTS = {
    number_expression: {
      domain: "数与代数",
      allowedQuestionTypes: ["number_operation", "expression_simplify", "like_terms", "radical_simplify"],
      forbiddenKeywords: ["概率", "骰子", "摸球", "sin", "cos", "tan"],
      templates: ["NumberLineAnimation", "ExpressionStepAnimation"],
      defaultTemplateType: "number_operation",
      answerType: "number"
    },
    equation_solving: {
      domain: "数与代数",
      allowedQuestionTypes: ["equation_solving", "linear_equation", "quadratic_equation"],
      forbiddenKeywords: ["概率", "骰子", "摸球", "面积公式除以2"],
      templates: ["EquationStepAnimation"],
      defaultTemplateType: "equation_solving",
      answerType: "expression"
    },
    function_graph: {
      domain: "函数",
      allowedQuestionTypes: ["function_value", "function_graph", "vertex_axis", "inverse_variation"],
      forbiddenKeywords: ["概率", "摸球", "骰子", "相似三角形"],
      templates: ["FunctionGraphAnimation"],
      defaultTemplateType: "function_graph",
      answerType: "number"
    },
    geometry_basic: {
      domain: "图形与几何",
      allowedQuestionTypes: ["geometry_concept", "angle_relation", "line_relation"],
      forbiddenKeywords: ["概率", "骰子", "摸球"],
      templates: ["GeometryConceptAnimation"],
      defaultTemplateType: "geometry_concept",
      answerType: "text"
    },
    area_formula: {
      domain: "图形与几何",
      allowedQuestionTypes: ["area_formula", "perimeter_formula", "volume_formula"],
      forbiddenKeywords: ["概率", "骰子", "摸球", "sin", "cos", "tan"],
      templates: ["AreaFormulaAnimation"],
      defaultTemplateType: "area_formula",
      answerType: "number"
    },
    similar_triangle: {
      domain: "图形与几何",
      allowedQuestionTypes: ["similar_triangle_ratio", "similar_triangle_unknown_side", "similar_triangle_scale"],
      forbiddenKeywords: ["概率", "骰子", "摸球", "面积公式除以2", "正面朝上", "随机"],
      templates: ["SimilarTriangleRatioAnimation"],
      defaultTemplateType: "similar_triangle_ratio",
      answerType: "number"
    },
    trigonometry: {
      domain: "图形与几何",
      allowedQuestionTypes: ["sin_basic", "cos_basic", "tan_basic", "special_angle_values", "right_triangle_trig"],
      forbiddenKeywords: ["概率", "骰子", "摸球", "相似三角形比例", "随机摸出"],
      templates: ["RightTriangleTrigAnimation", "SpecialAngleAnimation"],
      defaultTemplateType: "right_triangle_trig",
      answerType: "expression"
    },
    statistics: {
      domain: "统计与概率",
      allowedQuestionTypes: ["data_reading", "average", "median", "mode", "variance"],
      forbiddenKeywords: ["相似三角形", "sin", "cos", "tan", "斜边"],
      templates: ["DataChartAnimation"],
      defaultTemplateType: "data_statistics",
      answerType: "number"
    },
    probability: {
      domain: "统计与概率",
      allowedQuestionTypes: [
        "random_event",
        "simple_probability",
        "coin_probability",
        "dice_probability",
        "ball_probability",
        "turntable_probability"
      ],
      forbiddenKeywords: ["相似三角形", "锐角三角函数", "sin", "cos", "tan", "斜边", "直角三角形", "几何证明", "勾股定理", "面积公式"],
      templates: ["ProbabilityAnimation", "ProbabilityFormulaAnimation"],
      defaultTemplateType: "probability_simple",
      answerType: "number"
    },
    primary_arithmetic: {
      domain: "数与运算",
      allowedQuestionTypes: ["addition", "subtraction", "multiplication", "division", "word_problem"],
      forbiddenKeywords: ["sin", "cos", "tan", "相似三角形", "一元二次方程"],
      templates: ["ObjectGroupingAnimation"],
      defaultTemplateType: "primary_operation",
      answerType: "number"
    },
    fraction_decimal_percent: {
      domain: "数与运算",
      allowedQuestionTypes: ["fraction", "decimal", "percent", "ratio"],
      forbiddenKeywords: ["sin", "cos", "tan", "几何证明"],
      templates: ["FractionBarAnimation", "PercentBarAnimation"],
      defaultTemplateType: "fraction_decimal",
      answerType: "number"
    }
  };

  const KNOWLEDGE_MAP = {
    "有理数": { category: "number_expression", ids: ["rational-number"], chapter: "有理数", allowedQuestionTypes: ["signed_number", "number_line", "number_operation"], defaultTemplateType: "number_line" },
    "整式加减": { category: "number_expression", ids: ["polynomial-add-sub"], chapter: "整式加减", allowedQuestionTypes: ["like_terms"], defaultTemplateType: "expression_simplify" },
    "一元一次方程": { category: "equation_solving", ids: ["linear-equation-one"], chapter: "一元一次方程", allowedQuestionTypes: ["linear_equation", "equation_solving"] },
    "一元二次方程": { category: "equation_solving", ids: ["quadratic-equation"], chapter: "一元二次方程", allowedQuestionTypes: ["quadratic_equation"] },
    "函数基础": { category: "function_graph", ids: ["coordinate-system"], chapter: "平面直角坐标系", allowedQuestionTypes: ["coordinate", "function_graph"], defaultTemplateType: "coordinate_graph" },
    "一次函数": { category: "function_graph", ids: ["linear-function"], chapter: "一次函数", allowedQuestionTypes: ["linear_function_value", "function_graph"] },
    "二次函数": { category: "function_graph", ids: ["quadratic-function"], chapter: "二次函数", allowedQuestionTypes: ["quadratic_vertex", "function_graph"], defaultTemplateType: "quadratic_graph" },
    "几何图形初步": { category: "geometry_basic", ids: ["basic-geometry", "parallel-lines"], chapter: "几何图形初步" },
    "三角形": { category: "area_formula", ids: ["triangle"], chapter: "三角形", allowedQuestionTypes: ["triangle_area", "triangle_property"], defaultTemplateType: "area_formula" },
    "全等三角形": { category: "geometry_basic", ids: ["congruent-triangle"], chapter: "全等三角形", allowedQuestionTypes: ["congruence_rule"], defaultTemplateType: "geometry_concept" },
    "相似三角形": { category: "similar_triangle", ids: ["similar-triangle"], chapter: "相似三角形" },
    "锐角三角函数": { category: "trigonometry", ids: ["trigonometry"], chapter: "锐角三角函数" },
    "圆": { category: "area_formula", ids: ["circle", "sector"], chapter: "圆", allowedQuestionTypes: ["circle_area", "circle_circumference", "sector_area"], defaultTemplateType: "area_formula" },
    "统计": { category: "statistics", ids: ["data-collection", "data-analysis"], chapter: "统计" },
    "概率初步": { category: "probability", ids: ["probability"], chapter: "概率初步" },
    "四则运算": { category: "primary_arithmetic", ids: ["p1-add-sub-20", "p3-multi-operation"], chapter: "四则运算" },
    "分数": { category: "fraction_decimal_percent", ids: ["p3-fraction-basic", "p5-fraction-add", "p6-fraction-operation"], chapter: "分数" },
    "小数": { category: "fraction_decimal_percent", ids: ["p4-decimal", "p5-decimal-operation"], chapter: "小数" },
    "百分数": { category: "fraction_decimal_percent", ids: ["p6-percent"], chapter: "百分数" },
    "比和比例": { category: "fraction_decimal_percent", ids: ["p6-ratio"], chapter: "比和比例", defaultTemplateType: "ratio_relation" },
    "图形面积": { category: "area_formula", ids: ["p3-perimeter", "p4-quadrilateral", "p6-circle"], chapter: "图形面积" },
    "体积": { category: "area_formula", ids: ["p5-cuboid"], chapter: "体积", defaultTemplateType: "volume_formula" },
    "简单统计": { category: "statistics", ids: ["p1-classify", "p3-data"], chapter: "简单统计" }
  };

  const TYPE_ALIASES = {
    "摸球问题": "ball_probability",
    "掷骰子问题": "dice_probability",
    "抛硬币问题": "coin_probability",
    "抽数问题": "simple_probability",
    "转盘问题": "turntable_probability",
    "简单概率": "simple_probability",
    "相似三角形比例": "similar_triangle_ratio",
    "sin45°": "special_angle_values",
    "等腰直角三角形": "right_triangle_trig",
    "解方程": "equation_solving",
    "三角形面积": "area_formula",
    "圆面积": "area_formula",
    "圆周长": "perimeter_formula",
    "合并同类项": "like_terms"
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, "").toLowerCase();
  }

  function includesAny(text, words) {
    const source = normalizeText(text);
    return (words || []).some((word) => source.includes(normalizeText(word)));
  }

  function getAllConfigs() {
    return Object.entries(KNOWLEDGE_MAP).map(([name, item]) => {
      const base = CATEGORY_DEFAULTS[item.category] || CATEGORY_DEFAULTS.number_expression;
      return {
        name,
        ...clone(base),
        ...clone(item),
        ids: item.ids || [],
        chapter: item.chapter || name,
        allowedQuestionTypes: item.allowedQuestionTypes || base.allowedQuestionTypes,
        forbiddenKeywords: item.forbiddenKeywords || base.forbiddenKeywords,
        templates: item.templates || base.templates,
        defaultTemplateType: item.defaultTemplateType || base.defaultTemplateType,
        answerType: item.answerType || base.answerType
      };
    });
  }

  function resolveKnowledge(input = {}) {
    const id = String(input.modelId || input.knowledgeId || input.id || "").trim();
    const chapter = String(input.chapter || input.knowledge || input.knowledge_point || input.title || "").trim();
    const domain = String(input.domain || "").trim();
    const text = `${id} ${chapter}`;
    const configs = getAllConfigs();
    const byId = configs.find((config) => config.ids.includes(id));
    if (byId) return byId;
    const byChapter = configs.find((config) => chapter === config.chapter || chapter === config.name || text.includes(config.chapter));
    if (byChapter) return byChapter;
    if (/概率|随机|骰子|摸球|硬币|转盘/.test(text)) return configs.find((config) => config.name === "概率初步");
    if (/相似/.test(text)) return configs.find((config) => config.name === "相似三角形");
    if (/sin|cos|tan|锐角三角函数/.test(text)) return configs.find((config) => config.name === "锐角三角函数");
    if (/方程/.test(text)) return configs.find((config) => config.category === "equation_solving");
    if (/函数|坐标/.test(text) || domain === "函数") return configs.find((config) => config.category === "function_graph");
    if (/统计|平均数|中位数/.test(text)) return configs.find((config) => config.category === "statistics");
    if (/面积|周长|体积|圆|三角形/.test(text)) return configs.find((config) => config.category === "area_formula");
    return {
      name: chapter || "通用数学",
      chapter: chapter || "通用数学",
      ...CATEGORY_DEFAULTS.number_expression,
      ids: id ? [id] : []
    };
  }

  function normalizedQuestionType(value) {
    const text = String(value || "").trim();
    return TYPE_ALIASES[text] || text;
  }

  function inferTemplateType(question = {}, config = resolveKnowledge(question)) {
    if (question.templateType) return question.templateType;
    const rawType = normalizedQuestionType(question.type || question.questionType || question.subtype || "");
    const text = `${rawType} ${question.question || ""} ${question.knowledge_point || ""}`;
    if (/probability|概率|摸球|骰子|硬币|转盘|随机/.test(text)) return "probability_simple";
    if (/similar_triangle|相似/.test(text)) return "similar_triangle_ratio";
    if (/trig|sin|cos|tan|三角函数|45°|斜边/.test(text)) return "right_triangle_trig";
    if (/equation|方程|x=|解方程/.test(text)) return "equation_solving";
    if (/area|面积|周长|体积|底|高|半径/.test(text)) return "area_formula";
    if (/number_line|有理数|正负|温度|水下|海拔/.test(text)) return "number_line";
    if (/function|函数|抛物线|顶点|坐标/.test(text)) return "function_graph";
    if (/statistics|统计|平均数|中位数|众数/.test(text)) return "data_statistics";
    return config.defaultTemplateType || "generic_step";
  }

  function visualTypeForTemplate(templateType) {
    if (templateType === "probability_simple") return "probability";
    if (templateType === "similar_triangle_ratio") return "similar_triangle";
    if (templateType === "right_triangle_trig") return "right_triangle_trig";
    if (templateType === "equation_solving") return "equation";
    if (templateType === "area_formula") return "geometry";
    if (templateType === "number_line") return "number_line";
    if (templateType === "function_graph") return "function_graph";
    return "scene";
  }

  function numbersFromText(value) {
    const matches = String(value || "").match(/-?\d+(?:\.\d+)?/g);
    return matches ? matches.map(Number).filter(Number.isFinite) : [];
  }

  function inferKnownValues(question, templateType) {
    const text = `${question.question || ""} ${question.answer || question.standardAnswer || ""}`;
    const nums = numbersFromText(text);
    if (templateType === "probability_simple") {
      const fraction = String(question.answer || question.standardAnswer || "").match(/(\d+)\s*\/\s*(\d+)/);
      return {
        targetCount: fraction ? Number(fraction[1]) : nums[0],
        totalCount: fraction ? Number(fraction[2]) : nums[0] + (nums[1] || 0),
        favorableLabel: /红/.test(text) ? "红球" : /正面/.test(text) ? "正面" : /偶数/.test(text) ? "偶数" : "目标结果",
        allLabel: "所有等可能结果"
      };
    }
    if (templateType === "similar_triangle_ratio") {
      return {
        ratioBigToSmall: nums[0] || 1,
        smallSide: nums[1] || nums[0] || 1,
        bigSide: numbersFromText(question.answer || question.standardAnswer)[0],
        unit: /厘米|cm/.test(text) ? "厘米" : /米/.test(text) ? "米" : ""
      };
    }
    if (templateType === "right_triangle_trig") {
      return {
        angle: /60/.test(text) ? 60 : /30/.test(text) ? 30 : 45,
        opposite: 1,
        adjacent: 1,
        hypotenuse: "√2"
      };
    }
    return {};
  }

  function teacherStepsForTemplate(question, templateType, knownValues = {}) {
    const answer = question.standardAnswer || question.answer || "";
    if (templateType === "probability_simple") {
      return [
        {
          title: "数所有可能",
          narration: `先数一共有多少个等可能结果：${knownValues.totalCount || "总数"} 个。`,
          formula: "",
          action: "show_total",
          highlight: ["total"]
        },
        {
          title: "数目标结果",
          narration: `再数题目要的目标结果：${knownValues.targetCount || "目标数"} 个。`,
          formula: "",
          action: "show_target",
          highlight: ["target"]
        },
        {
          title: "写出概率",
          narration: `概率 = 目标结果数 ÷ 所有等可能结果数，所以答案是 ${answer}。`,
          formula: "概率 = 目标结果数 / 所有等可能结果数",
          action: "show_result",
          highlight: ["formula", "answer"]
        }
      ];
    }
    if (templateType === "similar_triangle_ratio") {
      return [
        {
          title: "找到对应边",
          narration: `先看小三角形的已知边：${knownValues.smallSide || "已知边"}${knownValues.unit || ""}。`,
          action: "show_corresponding_sides",
          highlight: ["smallSide"]
        },
        {
          title: "读出比例",
          narration: `两个三角形相似，对应边按同一个比例变化：大 : 小 = ${knownValues.ratioBigToSmall || "比例"} : 1。`,
          formula: `大 : 小 = ${knownValues.ratioBigToSmall || "比例"} : 1`,
          action: "show_ratio",
          highlight: ["ratio"]
        },
        {
          title: "计算未知边",
          narration: `大三角形对应边 = ${knownValues.smallSide || "已知边"} × ${knownValues.ratioBigToSmall || "比例"} = ${answer}。`,
          formula: `x = ${knownValues.smallSide || "已知边"} × ${knownValues.ratioBigToSmall || "比例"}`,
          action: "show_result",
          highlight: ["answer"]
        }
      ];
    }
    if (templateType === "right_triangle_trig") {
      return [
        {
          title: "认清直角三角形",
          narration: "先标出直角、锐角，以及相对于这个角的对边、邻边和斜边。",
          action: "show_triangle",
          highlight: ["angle"]
        },
        {
          title: "选择三角函数",
          narration: "如果要求 sin，就用 对边 ÷ 斜边；cos 用 邻边 ÷ 斜边；tan 用 对边 ÷ 邻边。",
          formula: "sin = 对边 / 斜边",
          action: "show_ratio",
          highlight: ["opposite", "hypotenuse"]
        },
        {
          title: "化简结果",
          narration: `代入边长并化简，得到 ${answer}。`,
          formula: String(answer),
          action: "show_result",
          highlight: ["answer"]
        }
      ];
    }
    if (templateType === "equation_solving") {
      return [
        { title: "看等式两边", narration: "先把方程看成天平，两边必须同时做同一种操作。", action: "show_balance", highlight: ["equation"] },
        { title: "消去常数项", narration: "先通过加减法把含 x 的项单独留下。", action: "remove_constant", highlight: ["operation"] },
        { title: "求一个 x", narration: `再把 x 的系数化为 1，得到 ${answer}。`, action: "divide_coefficient", highlight: ["answer"] }
      ];
    }
    const fallbackSteps = Array.isArray(question.steps) && question.steps.length
      ? question.steps.map((step, index) => ({
          title: typeof step === "object" ? step.title || `第${index + 1}步` : `第${index + 1}步`,
          narration: typeof step === "object" ? step.content || step.explain || "" : String(step),
          action: index === 0 ? "read_problem" : index === 1 ? "build_relation" : "show_result",
          highlight: index === 0 ? ["given"] : index === 1 ? ["relation"] : ["answer"]
        }))
      : [
          { title: "读题找条件", narration: "先圈出已知量和问题。", action: "read_problem", highlight: ["given"] },
          { title: "建立关系", narration: "把题目翻译成对应公式或规则。", action: "build_relation", highlight: ["relation"] },
          { title: "计算答案", narration: `最后得到 ${answer}。`, action: "show_result", highlight: ["answer"] }
        ];
    return fallbackSteps.slice(0, 5);
  }

  function structureQuestion(question = {}, context = {}) {
    const merged = { ...context, ...question };
    const config = resolveKnowledge(merged);
    const templateType = inferTemplateType(merged, config);
    const knownValues = {
      ...inferKnownValues(merged, templateType),
      ...(question.knownValues || {})
    };
    const animation_steps = question.animation_steps && question.animation_steps.length
      ? question.animation_steps
      : teacherStepsForTemplate(merged, templateType, knownValues);
    return {
      ...question,
      subject: question.subject || context.subject || "数学",
      schoolStage: question.schoolStage || context.schoolStage || context.stage,
      domain: question.domain || context.domain || config.domain,
      chapter: question.chapter || context.chapter || config.chapter,
      knowledge_point: question.knowledge_point || question.knowledgePoint || context.knowledgePoint || config.name,
      knowledgePoint: question.knowledgePoint || question.knowledge_point || context.knowledgePoint || config.name,
      answerType: question.answerType || config.answerType,
      templateType,
      visual_type: question.visual_type || visualTypeForTemplate(templateType),
      knownValues,
      unknown: question.unknown || "",
      animation_steps,
      common_mistakes: question.common_mistakes || question.commonMistakes || [question.commonMistake || "先确认题型，再选择对应方法。"],
      summary: question.summary || `这是一道${config.chapter}题，关键是使用${config.templates[0] || "固定教学模板"}。`
    };
  }

  function validateQuestion(question = {}, context = {}) {
    const structured = structureQuestion(question, context);
    const config = resolveKnowledge({ ...context, ...structured });
    const text = `${structured.question || ""} ${structured.knowledge_point || ""} ${structured.templateType || ""}`;
    const forbiddenHit = (config.forbiddenKeywords || []).find((word) => includesAny(text, [word]));
    if (forbiddenHit) {
      return { valid: false, reason: `出现越界关键词：${forbiddenHit}`, config, question: structured };
    }
    const type = normalizedQuestionType(structured.type || structured.questionType || structured.templateType);
    const allowed = config.allowedQuestionTypes || [];
    const knownTemplate = structured.templateType === config.defaultTemplateType || allowed.includes(type) || allowed.includes(structured.templateType);
    if (allowed.length && !knownTemplate && config.name !== "通用数学") {
      return { valid: false, reason: `题型不属于当前知识点：${type || structured.templateType}`, config, question: structured };
    }
    return { valid: true, reason: "", config, question: structured };
  }

  function buildAnimationLesson(question = {}, result = {}) {
    const structured = structureQuestion(question);
    return {
      question: structured.question,
      answer: structured.standardAnswer || structured.answer,
      analysis: structured.analysis || structured.explanation || "",
      templateType: structured.templateType,
      visual_type: structured.visual_type,
      knownValues: structured.knownValues,
      animation_steps: structured.animation_steps,
      common_mistakes: structured.common_mistakes,
      summary: result.memorySummary || structured.summary
    };
  }

  const api = {
    CATEGORY_DEFAULTS,
    KNOWLEDGE_MAP,
    resolveKnowledge,
    inferTemplateType,
    structureQuestion,
    validateQuestion,
    buildAnimationLesson,
    teacherStepsForTemplate
  };

  if (typeof window !== "undefined") {
    window.TeachingEngine = api;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})();
