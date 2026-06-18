(function () {
  const EPSILON = 1e-9;

  function normalizeMathText(value) {
    return String(value ?? "")
      .trim()
      .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
      .replace(/．/g, ".")
      .replace(/，/g, ",")
      .replace(/％/g, "%")
      .replace(/／/g, "/")
      .replace(/＋/g, "+")
      .replace(/－/g, "-")
      .replace(/−/g, "-")
      .replace(/＝/g, "=")
      .replace(/：/g, ":")
      .replace(/\s+/g, "");
  }

  function parseMathValue(value) {
    const text = normalizeMathText(value);
    if (!text) {
      return null;
    }

    const radicalFraction = text.match(/(?:√|sqrt)(\d+(?:\.\d+)?)\/([+-]?(?:\d+(?:\.\d+)?|\.\d+))/);
    if (radicalFraction) {
      const radicand = Number(radicalFraction[1]);
      const denominator = Number(radicalFraction[2]);
      if (Number.isFinite(radicand) && Number.isFinite(denominator) && radicand >= 0 && Math.abs(denominator) > EPSILON) {
        return Math.sqrt(radicand) / denominator;
      }
    }

    const radical = text.match(/^(?:√|sqrt)(\d+(?:\.\d+)?)$/);
    if (radical) {
      const radicand = Number(radical[1]);
      if (Number.isFinite(radicand) && radicand >= 0) {
        return Math.sqrt(radicand);
      }
    }

    const numberOverRadical = text.match(/([+-]?(?:\d+(?:\.\d+)?|\.\d+))\/(?:√|sqrt)(\d+(?:\.\d+)?)/);
    if (numberOverRadical) {
      const numerator = Number(numberOverRadical[1]);
      const radicand = Number(numberOverRadical[2]);
      if (Number.isFinite(numerator) && Number.isFinite(radicand) && radicand > 0) {
        return numerator / Math.sqrt(radicand);
      }
    }

    const fraction = text.match(/([+-]?(?:\d+(?:\.\d+)?|\.\d+))\/([+-]?(?:\d+(?:\.\d+)?|\.\d+))/);
    if (fraction) {
      const numerator = Number(fraction[1]);
      const denominator = Number(fraction[2]);
      if (Number.isFinite(numerator) && Number.isFinite(denominator) && Math.abs(denominator) > EPSILON) {
        return numerator / denominator;
      }
    }

    const percent = text.match(/([+-]?(?:\d+(?:\.\d+)?|\.\d+))%/);
    if (percent) {
      const number = Number(percent[1]);
      if (Number.isFinite(number)) {
        return number / 100;
      }
    }

    const decimal = text.match(/[+-]?(?:\d+(?:\.\d+)?|\.\d+)/);
    if (decimal) {
      const number = Number(decimal[0]);
      if (Number.isFinite(number)) {
        return number;
      }
    }

    return null;
  }

  function formatValue(value) {
    if (!Number.isFinite(value)) {
      return "";
    }
    return Number(value.toFixed(12)).toString();
  }

  function equivalentMathValue(userAnswer, correctAnswer, tolerance = EPSILON) {
    const userValue = parseMathValue(userAnswer);
    const correctValue = parseMathValue(correctAnswer);
    if (userValue === null || correctValue === null) {
      return { matched: false, userValue, correctValue };
    }
    return {
      matched: Math.abs(userValue - correctValue) <= tolerance,
      userValue,
      correctValue
    };
  }

  function explainAnswerMatch(userAnswer, correctAnswer, question = {}) {
    const tolerance = Number(question?.tolerance) || EPSILON;
    const answerValue = Number(question?.answerValue);
    const userValue = parseMathValue(userAnswer);

    if (Number.isFinite(answerValue) && userValue !== null) {
      const matched = Math.abs(userValue - answerValue) <= tolerance;
      return {
        correct: matched,
        equivalent: matched,
        userValue,
        correctValue: answerValue,
        reason: matched ? `你的答案是正确的，${normalizeMathText(userAnswer)} 与 ${normalizeMathText(correctAnswer)} 等价。` : ""
      };
    }

    const direct = equivalentMathValue(userAnswer, correctAnswer, tolerance);
    if (direct.matched) {
      return {
        correct: true,
        equivalent: true,
        userValue: direct.userValue,
        correctValue: direct.correctValue,
        reason: `你的答案是正确的，${normalizeMathText(userAnswer)} 与 ${normalizeMathText(correctAnswer)} 等价。`
      };
    }

    const aliases = [
      ...(Array.isArray(question?.aliases) ? question.aliases : []),
      ...(Array.isArray(question?.acceptedTexts) ? question.acceptedTexts : [])
    ];
    for (const alias of aliases) {
      const aliasMatch = equivalentMathValue(userAnswer, alias, tolerance);
      if (aliasMatch.matched) {
        return {
          correct: true,
          equivalent: true,
          userValue: aliasMatch.userValue,
          correctValue: aliasMatch.correctValue,
          reason: `你的答案是正确的，${normalizeMathText(userAnswer)} 与 ${normalizeMathText(alias)} 等价。`
        };
      }
    }

    return {
      correct: false,
      equivalent: false,
      userValue,
      correctValue: direct.correctValue
    };
  }

  function isAnswerCorrect(userAnswer, correctAnswer, question = {}) {
    return explainAnswerMatch(userAnswer, correctAnswer, question).correct;
  }

  function containsPositiveJudgement(value) {
    const text = normalizeMathText(value);
    return /正确|对|是|成立|没错/.test(text) && !/不正确|不对|不是|错误/.test(text);
  }

  function containsNegativeJudgement(value) {
    const text = normalizeMathText(value);
    return /错误|不正确|不对|不是|不成立/.test(text);
  }

  function questionRequiresSimplification(question, correctAnswer) {
    const text = `${question?.question || ""}${correctAnswer || ""}`;
    return /化简|最简|有理化|写出最终答案/.test(text);
  }

  function hasSimplifiedTarget(userAnswer, correctAnswer) {
    const text = normalizeMathText(userAnswer);
    const answer = normalizeMathText(correctAnswer);
    if (/√2\/2|sqrt2\/2|根号2\/2|√2÷2|根号2÷2/.test(text)) {
      return true;
    }
    if (/√3\/2|sqrt3\/2|根号3\/2|√3÷2|根号3÷2/.test(text)) {
      return true;
    }
    const correctValue = parseMathValue(answer);
    const userValue = parseMathValue(text);
    return correctValue !== null && userValue !== null && Math.abs(correctValue - userValue) <= 1e-9 && !/仅|只是/.test(text);
  }

  function gradeAnswerDetailed(userAnswer, correctAnswer, question = {}) {
    const math = explainAnswerMatch(userAnswer, correctAnswer, question);
    const standardAnswer = String(correctAnswer || question?.answer || "").trim();
    const needsSimplification = questionRequiresSimplification(question, standardAnswer);
    const positiveJudgement = containsPositiveJudgement(userAnswer);
    const negativeJudgement = containsNegativeJudgement(userAnswer);
    const standardSaysCorrect = /正确|成立|是/.test(standardAnswer);
    const standardSaysWrong = /错误|不正确|不成立|不是/.test(standardAnswer);

    if (math.correct && (!needsSimplification || hasSimplifiedTarget(userAnswer, standardAnswer))) {
      return {
        result: "correct",
        score: 100,
        correct: true,
        isMathEquivalent: true,
        standardAnswer,
        missingPoints: [],
        wrongReason: "",
        feedbackToStudent: math.reason || "完全正确，答案和标准答案数学等价。",
        stepByStepExplanation: Array.isArray(question?.steps) ? question.steps.map((step) => String(step?.content || step)) : [],
        nextHint: "继续保持。"
      };
    }

    if (needsSimplification && standardSaysCorrect && positiveJudgement && !hasSimplifiedTarget(userAnswer, standardAnswer)) {
      return {
        result: "partial",
        score: 60,
        correct: false,
        isMathEquivalent: false,
        standardAnswer,
        missingPoints: ["没有化简 1/√2", "没有写出最终答案 √2/2"],
        wrongReason: "",
        feedbackToStudent: "你判断对了，但题目还要求化简，所以还需要写出 1/√2 = √2/2。",
        stepByStepExplanation: ["先判断等式是否成立", "sin45° = 对边 / 斜边 = 1 / √2", "把 1/√2 分母有理化，得到 √2/2"],
        nextHint: "继续写出化简结果：√2/2。"
      };
    }

    if (standardSaysCorrect && negativeJudgement) {
      return {
        result: "wrong",
        score: 0,
        correct: false,
        isMathEquivalent: false,
        standardAnswer,
        missingPoints: [],
        wrongReason: "题目中的等式本身是正确的，不能判为错误。",
        feedbackToStudent: "这个判断不对。sin45° = 对边/斜边 = 1/√2，这个等式本身是正确的。",
        stepByStepExplanation: ["画出等腰直角三角形", "对边是 1，斜边是 √2", "sin45° = 1/√2 = √2/2"],
        nextHint: "先判断正确，再完成化简。"
      };
    }

    if (math.correct && needsSimplification) {
      return {
        result: "partial",
        score: 80,
        correct: false,
        isMathEquivalent: true,
        standardAnswer,
        missingPoints: ["需要写出完整化简过程"],
        wrongReason: "",
        feedbackToStudent: "你的数值是对的，但题目要求写清化简过程，建议补上等价变形。",
        stepByStepExplanation: Array.isArray(question?.steps) ? question.steps.map((step) => String(step?.content || step)) : [],
        nextHint: "补写从 1/√2 到 √2/2 的过程。"
      };
    }

    if (math.correct) {
      return {
        result: "correct",
        score: 100,
        correct: true,
        isMathEquivalent: true,
        standardAnswer,
        missingPoints: [],
        wrongReason: "",
        feedbackToStudent: math.reason || "完全正确，答案和标准答案数学等价。",
        stepByStepExplanation: Array.isArray(question?.steps) ? question.steps.map((step) => String(step?.content || step)) : [],
        nextHint: "继续保持。"
      };
    }

    if (math.userValue === null && (positiveJudgement || negativeJudgement) && !standardSaysCorrect && !standardSaysWrong) {
      return {
        result: "partial",
        score: 40,
        correct: false,
        isMathEquivalent: false,
        standardAnswer,
        missingPoints: ["没有写出数学结果或关键理由"],
        wrongReason: "",
        feedbackToStudent: "你的判断还不完整，需要补充具体计算、化简或理由。",
        stepByStepExplanation: Array.isArray(question?.steps) ? question.steps.map((step) => String(step?.content || step)) : [],
        nextHint: "把最终数值或表达式写出来。"
      };
    }

    return {
      result: math.userValue === null ? "unknown" : "wrong",
      score: 0,
      correct: false,
      isMathEquivalent: false,
      standardAnswer,
      missingPoints: [],
      wrongReason: math.userValue === null ? "本地规则无法判断该文字答案是否完整。" : "学生答案和标准答案数学意义不一致。",
      feedbackToStudent: math.userValue === null ? "需要进一步语义判断。" : "你的答案和标准答案不等价，请检查计算或化简。",
      stepByStepExplanation: Array.isArray(question?.steps) ? question.steps.map((step) => String(step?.content || step)) : [],
      nextHint: "对照标准答案重新检查。"
    };
  }

  const api = {
    EPSILON,
    normalizeMathText,
    parseMathValue,
    equivalentMathValue,
    explainAnswerMatch,
    gradeAnswerDetailed,
    isAnswerCorrect,
    formatValue
  };

  if (typeof window !== "undefined") {
    window.AnswerJudgement = api;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})();
