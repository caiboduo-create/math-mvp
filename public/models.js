(function () {
  const round = (value, digits = 2) => Number(value).toFixed(digits).replace(/\.?0+$/, "");
  const pi = Math.PI;

  const models = [
    {
      id: "circle",
      name: "圆",
      symbol: "C",
      description: "半径变化时，面积按平方增长，周长按线性增长。",
      visual: "circle",
      tags: ["半径", "面积", "周长"],
      params: [
        { key: "radius", label: "半径 r", min: 2, max: 10, step: 0.1, value: 5, unit: "" }
      ],
      metrics: (p) => ({
        "面积 S": `约 ${round(pi * p.radius * p.radius)}`,
        "周长 C": `约 ${round(2 * pi * p.radius)}`,
        "核心公式": "S = πr²，C = 2πr"
      }),
      explanation: (p) =>
        `圆由半径 r 决定。现在 r=${round(p.radius)}，面积 S=πr²，周长 C=2πr。半径加倍时，周长加倍，但面积会变成原来的 4 倍。`,
      exercise: (p) => {
        const r = round(p.radius);
        return {
          question: `当圆的半径 r=${r} 时，写出它的面积公式并求近似面积。`,
          answer: `S=πr²=π×${r}²≈${round(pi * p.radius * p.radius)}。`
        };
      }
    },
    {
      id: "triangle",
      name: "三角形",
      symbol: "T",
      description: "底和高共同决定面积，顶点移动会改变形状但不改变同底等高面积。",
      visual: "triangle",
      tags: ["底", "高", "面积"],
      params: [
        { key: "base", label: "底 b", min: 4, max: 12, step: 0.1, value: 8, unit: "" },
        { key: "height", label: "高 h", min: 3, max: 10, step: 0.1, value: 6, unit: "" },
        { key: "shift", label: "顶点偏移", min: -3, max: 3, step: 0.1, value: 0, unit: "" }
      ],
      metrics: (p) => ({
        "面积 S": round((p.base * p.height) / 2),
        "底高关系": "S = 1/2 × b × h",
        "顶点偏移": round(p.shift)
      }),
      explanation: (p) =>
        `三角形面积只看底和对应的高。现在 b=${round(p.base)}，h=${round(p.height)}，所以 S=1/2×b×h=${round((p.base * p.height) / 2)}。左右移动顶点会改变边长，但只要底和高不变，面积不变。`,
      exercise: (p) => ({
        question: `底 b=${round(p.base)}、高 h=${round(p.height)} 的三角形面积是多少？`,
        answer: `S=1/2×${round(p.base)}×${round(p.height)}=${round((p.base * p.height) / 2)}。`
      })
    },
    {
      id: "parabola",
      name: "抛物线",
      symbol: "P",
      description: "a 控制开口方向和宽窄，h 与 k 控制顶点位置。",
      visual: "parabola",
      tags: ["二次函数", "顶点", "开口"],
      params: [
        { key: "a", label: "系数 a", min: -2, max: 2, step: 0.1, value: 0.8, unit: "" },
        { key: "h", label: "顶点横坐标 h", min: -4, max: 4, step: 0.1, value: 0, unit: "" },
        { key: "k", label: "顶点纵坐标 k", min: -5, max: 5, step: 0.1, value: 0, unit: "" }
      ],
      metrics: (p) => ({
        "函数": `y = ${round(p.a)}(x - ${round(p.h)})² + ${round(p.k)}`,
        "顶点": `(${round(p.h)}, ${round(p.k)})`,
        "开口": p.a >= 0 ? "向上" : "向下"
      }),
      explanation: (p) =>
        `抛物线可以写成顶点式 y=a(x-h)²+k。当前顶点是 (${round(p.h)}, ${round(p.k)})。a=${round(p.a)}，所以开口${p.a >= 0 ? "向上" : "向下"}；|a| 越大，曲线越窄。`,
      exercise: (p) => ({
        question: `函数 y=${round(p.a)}(x-${round(p.h)})²+${round(p.k)} 的顶点和开口方向是什么？`,
        answer: `顶点是 (${round(p.h)}, ${round(p.k)})，因为 a=${round(p.a)}，所以开口${p.a >= 0 ? "向上" : "向下"}。`
      })
    },
    {
      id: "sector",
      name: "扇形",
      symbol: "S",
      description: "扇形由半径和圆心角决定，是圆的一部分。",
      visual: "sector",
      tags: ["半径", "圆心角", "弧长"],
      params: [
        { key: "radius", label: "半径 r", min: 2, max: 10, step: 0.1, value: 6, unit: "" },
        { key: "angle", label: "圆心角 θ", min: 30, max: 330, step: 1, value: 120, unit: "°" }
      ],
      metrics: (p) => ({
        "面积 S": round((p.angle / 360) * pi * p.radius * p.radius),
        "弧长 L": round((p.angle / 360) * 2 * pi * p.radius),
        "核心公式": "S = θ/360° × πr²，L = θ/360° × 2πr"
      }),
      explanation: (p) =>
        `扇形是圆的一部分。现在 r=${round(p.radius)}，θ=${round(p.angle)}°，它占整个圆的 ${round(p.angle / 360)}。面积和弧长都按这个比例从整圆中取出。`,
      exercise: (p) => ({
        question: `半径 r=${round(p.radius)}、圆心角 θ=${round(p.angle)}° 的扇形弧长约是多少？`,
        answer: `L=θ/360°×2πr=${round(p.angle)}/360×2π×${round(p.radius)}≈${round((p.angle / 360) * 2 * pi * p.radius)}。`
      })
    }
  ];

  window.MathCoursewareModels = {
    models,
    getModel(id) {
      return models.find((model) => model.id === id);
    },
    round
  };
})();
