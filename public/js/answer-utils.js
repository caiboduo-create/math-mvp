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

  const api = {
    EPSILON,
    normalizeMathText,
    parseMathValue,
    equivalentMathValue,
    explainAnswerMatch,
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
