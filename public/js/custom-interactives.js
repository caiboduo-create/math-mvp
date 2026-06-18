(function () {
  const svgNs = "http://www.w3.org/2000/svg";

  function round(value, digits = 2) {
    return Number(value).toFixed(digits).replace(/\.?0+$/, "");
  }

  function createEl(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function createSvg(attrs = {}) {
    const svg = document.createElementNS(svgNs, "svg");
    Object.entries(attrs).forEach(([key, value]) => svg.setAttribute(key, value));
    return svg;
  }

  function createSvgEl(tag, attrs = {}, text = "") {
    const node = document.createElementNS(svgNs, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) {
      node.textContent = text;
    }
    return node;
  }

  function buildShell(model, label, tipText) {
    const wrap = createEl("div", `custom-interactive template-${model.interactive.template}`);
    const layout = createEl("div", "custom-interactive-layout");
    const stage = createEl("div", "custom-stage");
    const controls = createEl("div", "custom-controls");
    const result = createEl("div", "custom-result");
    const tip = createEl("div", "observation-tip");
    const tipLabel = createEl("strong", "", "观察提示：");
    const tipBody = createEl("span", "", tipText);

    const badge = createEl("div", "interactive-badge", label);
    stage.appendChild(badge);
    tip.append(tipLabel, tipBody);
    layout.append(stage, controls);
    wrap.append(layout, result, tip);

    return { wrap, stage, controls, result };
  }

  function makeRange(label, min, max, step, value, onInput) {
    const control = createEl("label", "custom-slider");
    const valueEl = createEl("strong", "", round(value));
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.addEventListener("input", () => {
      valueEl.textContent = round(input.value);
      onInput(Number(input.value));
    });

    const head = createEl("span", "custom-slider-label");
    head.append(createEl("span", "", label), valueEl);
    control.append(head, input);
    return control;
  }

  function makeButton(text, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary-button custom-button";
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
  }

  function lineX(value, min = -10, max = 10) {
    return 54 + ((value - min) / (max - min)) * 532;
  }

  function renderNumberLine(model, container) {
    const isInequality = model.id === "inequality";
    let a = isInequality ? -3 : -4;
    let b = isInequality ? 2 : 5;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "数轴实验台",
      isInequality ? "拖动边界值，看看解集区间如何在数轴上移动。" : "拖动两个数，比较大小并观察它们到 0 的距离。"
    );

    const svg = createSvg({ viewBox: "0 0 640 190", class: "custom-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      svg.appendChild(createSvgEl("line", { x1: 42, y1: 100, x2: 598, y2: 100, class: "axis-line" }));
      svg.appendChild(createSvgEl("polygon", { points: "598,100 586,94 586,106", class: "axis-arrow" }));

      for (let i = -10; i <= 10; i += 1) {
        const x = lineX(i);
        svg.appendChild(createSvgEl("line", { x1: x, y1: 92, x2: x, y2: 108, class: "tick-line" }));
        if (i % 2 === 0) {
          svg.appendChild(createSvgEl("text", { x, y: 132, class: "custom-svg-label", "text-anchor": "middle" }, String(i)));
        }
      }

      if (isInequality) {
        const threshold = lineX(a);
        svg.appendChild(createSvgEl("line", { x1: threshold, y1: 100, x2: 586, y2: 100, class: "range-highlight" }));
        svg.appendChild(createSvgEl("circle", { cx: threshold, cy: 100, r: 10, class: "custom-point hollow" }));
        svg.appendChild(createSvgEl("text", { x: threshold, y: 72, class: "custom-svg-label", "text-anchor": "middle" }, `x > ${a}`));
        result.textContent = `解集：x > ${a}。数轴上从 ${a} 向右的部分都满足不等式。`;
        return;
      }

      const xA = lineX(a);
      const xB = lineX(b);
      svg.appendChild(createSvgEl("circle", { cx: xA, cy: 100, r: 10, class: "custom-point" }));
      svg.appendChild(createSvgEl("circle", { cx: xB, cy: 100, r: 10, class: "custom-point warm" }));
      svg.appendChild(createSvgEl("text", { x: xA, y: 72, class: "custom-svg-label", "text-anchor": "middle" }, `A=${a}`));
      svg.appendChild(createSvgEl("text", { x: xB, y: 72, class: "custom-svg-label", "text-anchor": "middle" }, `B=${b}`));
      result.textContent = `比较：${a} ${a > b ? ">" : a < b ? "<" : "="} ${b}。绝对值：|${a}|=${Math.abs(a)}，|${b}|=${Math.abs(b)}。`;
    }

    controls.appendChild(makeRange(isInequality ? "边界值" : "数 A", -10, 10, 1, a, (value) => {
      a = value;
      draw();
    }));

    if (!isInequality) {
      controls.appendChild(makeRange("数 B", -10, 10, 1, b, (value) => {
        b = value;
        draw();
      }));
    }

    draw();
    container.appendChild(wrap);
  }

  function renderEquationBalance(model, container) {
    const isSystem = model.id === "linear-equations-two";
    let x = 2;
    let y = 5;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "方程天平",
      "拖动未知数取值，观察左右两边什么时候一样高。"
    );

    const balance = createEl("div", "balance-board");
    const leftPan = createEl("div", "balance-pan");
    const rightPan = createEl("div", "balance-pan");
    const beam = createEl("div", "balance-beam");
    balance.append(leftPan, beam, rightPan);
    stage.appendChild(balance);

    function draw() {
      const leftValue = isSystem ? x + y : 2 * x + 3;
      const rightValue = isSystem ? 7 : 11;
      const secondLeft = 2 * x - y;
      const secondRight = 2;
      const diff = Math.abs(leftValue - rightValue);
      leftPan.style.transform = `translateY(${Math.min(24, Math.max(-24, (leftValue - rightValue) * 3))}px)`;
      rightPan.style.transform = `translateY(${Math.min(24, Math.max(-24, (rightValue - leftValue) * 3))}px)`;
      leftPan.textContent = isSystem ? `x+y=${round(leftValue)}` : `2x+3=${round(leftValue)}`;
      rightPan.textContent = isSystem ? `7` : `11`;

      if (isSystem) {
        const ok = diff <= 0.01 && Math.abs(secondLeft - secondRight) <= 0.01;
        result.textContent = `方程组：x+y=7，2x-y=2。当前 x=${x}，y=${y}，第二式左边=${round(secondLeft)}，${ok ? "两个方程都成立。" : "还没有同时成立。"}`;
      } else {
        result.textContent = `方程：2x+3=11。当前 x=${x}，左边=${round(leftValue)}，右边=11，${diff <= 0.01 ? "天平平衡，x 是方程的解。" : "天平未平衡，继续调整 x。"}`;
      }
    }

    controls.appendChild(makeRange("x 的值", -5, 10, 1, x, (value) => {
      x = value;
      draw();
    }));

    if (isSystem) {
      controls.appendChild(makeRange("y 的值", -5, 10, 1, y, (value) => {
        y = value;
        draw();
      }));
    }

    draw();
    container.appendChild(wrap);
  }

  function termPowerLabel(term) {
    if (!term.variable) {
      return "常数项";
    }
    return `${term.variable}${term.power === 2 ? "²" : ""} 项`;
  }

  function termGroupKey(term) {
    return term.variable ? `${term.variable}_${term.power}` : "constant";
  }

  function formatTerm(term, leading = false) {
    const negative = term.coef < 0;
    const abs = Math.abs(term.coef);
    const sign = negative ? "-" : leading ? "" : "+";

    if (!term.variable) {
      return `${sign}${abs}`;
    }

    const variablePart = `${term.variable}${term.power === 2 ? "²" : ""}`;
    const coefficient = abs === 1 ? "" : String(abs);
    return `${sign}${coefficient}${variablePart}`;
  }

  function termsToExpression(terms) {
    function termBody(term) {
      const abs = Math.abs(term.coef);
      if (!term.variable) {
        return String(abs);
      }
      const variablePart = `${term.variable}${term.power === 2 ? "²" : ""}`;
      return `${abs === 1 ? "" : abs}${variablePart}`;
    }

    return terms
      .map((term, index) => {
        const sign = term.coef < 0 ? "-" : "+";
        if (index === 0) {
          return `${term.coef < 0 ? "-" : ""}${termBody(term)}`;
        }
        return `${sign} ${termBody(term)}`;
      })
      .join(" ");
  }

  function combineTerms(terms) {
    const groups = new Map();
    terms.forEach((term) => {
      const key = termGroupKey(term);
      if (!groups.has(key)) {
        groups.set(key, { ...term, coef: 0 });
      }
      groups.get(key).coef += term.coef;
    });

    const combined = [...groups.values()].filter((term) => term.coef !== 0);
    return combined.length > 0 ? termsToExpression(combined) : "0";
  }

  function groupTerms(terms) {
    const groups = [];
    terms.forEach((term) => {
      const key = termGroupKey(term);
      let group = groups.find((item) => item.key === key);
      if (!group) {
        group = {
          key,
          label: termPowerLabel(term),
          terms: []
        };
        groups.push(group);
      }
      group.terms.push(term);
    });
    return groups;
  }

  function renderLikeTermSorter(model, container) {
    const examples = [
      [
        { coef: 3, variable: "x", power: 1 },
        { coef: 4 },
        { coef: 2, variable: "x", power: 1 },
        { coef: -1 }
      ],
      [
        { coef: 2, variable: "x", power: 1 },
        { coef: 5 },
        { coef: 4, variable: "x", power: 1 },
        { coef: -3 }
      ],
      [
        { coef: 7, variable: "a", power: 1 },
        { coef: -2 },
        { coef: 3, variable: "a", power: 1 },
        { coef: 6 }
      ],
      [
        { coef: 5, variable: "y", power: 1 },
        { coef: -4, variable: "y", power: 1 },
        { coef: 8 },
        { coef: -3 }
      ],
      [
        { coef: 2, variable: "x", power: 2 },
        { coef: 3, variable: "x", power: 1 },
        { coef: 1, variable: "x", power: 2 },
        { coef: -1, variable: "x", power: 1 },
        { coef: 4 }
      ]
    ];

    let index = 0;
    let exampleQueue = [];
    let step = 0;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "同类项合并实验台",
      "把颜色相同、字母和指数都相同的项合并；x² 项、x 项和常数项不能混合合并。"
    );

    stage.classList.add("like-term-stage");
    const expressionBox = createEl("div", "expression-focus compact-expression");
    const colorHint = createEl("p", "term-color-hint", "蓝色是 x 项，橙色是常数项。");
    stage.append(expressionBox, colorHint);

    const stepButtons = [
      makeButton("第一步：找同类项", () => {
        step = 1;
        draw();
      }),
      makeButton("第二步：分别合并", () => {
        step = 2;
        draw();
      }),
      makeButton("第三步：得到结果", () => {
        step = 3;
        draw();
      }),
      makeButton("换一个例子", () => {
        index = nextExampleIndex();
        step = 0;
        draw();
      })
    ];
    stepButtons.forEach((button) => controls.appendChild(button));

    function nextExampleIndex() {
      if (exampleQueue.length === 0) {
        exampleQueue = examples
          .map((_, exampleIndex) => exampleIndex)
          .filter((exampleIndex) => exampleIndex !== index)
          .sort(() => Math.random() - 0.5);
      }
      return exampleQueue.shift();
    }

    function termBadge(term) {
      const className = term.variable
        ? `term-badge term-variable${term.power === 2 ? " term-square" : ""}${term.coef < 0 ? " negative" : ""}`
        : `term-badge term-constant${term.coef < 0 ? " negative" : ""}`;
      return createEl("span", className, formatTerm(term, true));
    }

    function renderExpression(terms) {
      expressionBox.replaceChildren();
      const label = createEl("strong", "", "原式");
      const line = createEl("div", "colored-expression");
      terms.forEach((term, termIndex) => {
        if (termIndex > 0 || term.coef < 0) {
          line.appendChild(createEl("span", "expression-operator", term.coef < 0 ? "-" : "+"));
        }
        line.appendChild(termBadge({ ...term, coef: Math.abs(term.coef) }));
      });
      expressionBox.append(label, line);
    }

    function groupedExpression(groups) {
      return groups.map((group) => `(${termsToExpression(group.terms)})`).join(" + ").replace(/\+ \(/g, "+ (");
    }

    function explanationFor(terms, groups) {
      const hasSquare = terms.some((term) => term.power === 2);
      const firstVariableGroup = groups.find((group) => group.key !== "constant");
      const constantGroup = groups.find((group) => group.key === "constant");
      const variableText = firstVariableGroup
        ? `${firstVariableGroup.terms.map((term) => formatTerm(term, true)).join(" 和 ")} 都属于 ${firstVariableGroup.label}，所以可以合并。`
        : "";
      const constantText = constantGroup
        ? `${constantGroup.terms.map((term) => formatTerm(term, true)).join(" 和 ")} 都是常数，所以可以合并。`
        : "";
      const squareText = hasSquare ? "注意：x² 与 x 的字母指数不同，不是同类项，不能合并。" : "x 项和常数项不是同类项，不能合并。";
      return [variableText, constantText, squareText].filter(Boolean);
    }

    function draw() {
      const terms = examples[index];
      const groups = groupTerms(terms);
      const original = termsToExpression(terms);
      const grouped = groupedExpression(groups);
      const combined = combineTerms(terms);

      renderExpression(terms);
      const hasSquare = terms.some((term) => term.power === 2);
      colorHint.textContent = hasSquare ? "浅蓝是 x² 项，蓝色是 x 项，橙色是常数项。" : "蓝色是 x 项，橙色是常数项。";

      stepButtons.forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === step - 1);
      });

      result.replaceChildren();
      const title = createEl("strong", "", step === 0 ? "操作提示" : `第 ${step} 步`);
      const body = createEl("div", "step-explanation");
      if (step === 0) {
        body.appendChild(createEl("p", "", "把颜色相同的同类项合并。"));
      } else if (step === 1) {
        body.appendChild(createEl("p", "", `当前过程：${original}`));
        body.appendChild(createEl("p", "", "先看字母和指数是否完全相同。"));
      } else if (step === 2) {
        body.appendChild(createEl("p", "", `当前过程：${grouped}`));
        body.appendChild(createEl("p", "", "同类项放在一起，分别合并。"));
      } else {
        body.appendChild(createEl("p", "", `当前过程：${combined}`));
        body.appendChild(createEl("p", "", `结果：${original} = ${combined}`));
      }
      result.append(title, body);
    }

    draw();
    container.appendChild(wrap);
  }

  function renderAlgebraTiles(model, container) {
    const options = [
      { name: "合并同类项", x2: 1, x: 3, one: 4, result: "x² + 3x + 4" },
      { name: "平方差面积", x2: 1, x: 0, one: -9, result: "x² - 9 = (x+3)(x-3)" },
      { name: "完全平方", x2: 1, x: 6, one: 9, result: "x² + 6x + 9 = (x+3)²" },
      { name: "提公因式", x2: 0, x: 4, one: 8, result: "4x + 8 = 4(x+2)" }
    ];
    let index = 0;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "代数块拼图",
      "把 x²、x 和常数块看成面积，表达式的结构会更直观。"
    );
    const board = createEl("div", "tile-board");
    stage.appendChild(board);

    function addTiles(count, className, label) {
      const amount = Math.min(Math.abs(count), 12);
      for (let i = 0; i < amount; i += 1) {
        const tile = createEl("span", `algebra-tile ${className}${count < 0 ? " negative" : ""}`, label);
        board.appendChild(tile);
      }
    }

    function draw() {
      const option = options[index];
      board.replaceChildren();
      addTiles(option.x2, "tile-x2", "x²");
      addTiles(option.x, "tile-x", "x");
      addTiles(option.one, "tile-one", "1");
      result.textContent = `${option.name}：${option.result}`;
    }

    controls.appendChild(makeButton("生成一个表达式", () => {
      index = (index + 1) % options.length;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderAreaTileModel(model, container, config) {
    let index = 0;
    const { wrap, stage, controls, result } = buildShell(model, config.label, config.tip);
    const board = createEl("div", "tile-board");
    stage.appendChild(board);

    function addTiles(count, className, label) {
      const amount = Math.min(Math.abs(count), 14);
      for (let i = 0; i < amount; i += 1) {
        const tile = createEl("span", `algebra-tile ${className}${count < 0 ? " negative" : ""}`, label);
        board.appendChild(tile);
      }
    }

    function draw() {
      const option = config.options[index];
      board.replaceChildren();
      addTiles(option.x2 || 0, "tile-x2", "x²");
      addTiles(option.x || 0, "tile-x", "x");
      addTiles(option.one || 0, "tile-one", "1");
      result.textContent = `${option.name}：${option.result}`;
    }

    controls.appendChild(makeButton(config.button, () => {
      index = (index + 1) % config.options.length;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderAreaMultiplication(model, container) {
    renderAreaTileModel(model, container, {
      label: "面积乘法模型",
      tip: "把长和宽拆成几段，面积分块相加，就是多项式乘法的分配过程。",
      button: "换一个乘法例子",
      options: [
        { name: "单项式乘多项式", x2: 2, x: 6, one: 0, result: "2x(x+3)=2x²+6x" },
        { name: "多项式乘多项式", x2: 1, x: 5, one: 6, result: "(x+2)(x+3)=x²+5x+6" },
        { name: "含常数项乘法", x2: 1, x: 4, one: 3, result: "(x+1)(x+3)=x²+4x+3" }
      ]
    });
  }

  function renderSquareFormulaArea(model, container) {
    renderAreaTileModel(model, container, {
      label: "乘法公式面积模型",
      tip: "用正方形和长方形分块观察公式，重点是公式结构，不是合并同类项。",
      button: "换一个公式例子",
      options: [
        { name: "完全平方公式", x2: 1, x: 6, one: 9, result: "(x+3)²=x²+6x+9" },
        { name: "平方差公式", x2: 1, x: 0, one: -16, result: "(x+4)(x-4)=x²-16" },
        { name: "完全平方公式", x2: 1, x: 10, one: 25, result: "(x+5)²=x²+10x+25" }
      ]
    });
  }

  function renderReverseAreaFactorization(model, container) {
    renderAreaTileModel(model, container, {
      label: "反向面积分解",
      tip: "把已有面积块重新排成长方形，反向读出边长，就是因式分解。",
      button: "换一个分解例子",
      options: [
        { name: "提公因式", x2: 0, x: 4, one: 8, result: "4x+8=4(x+2)" },
        { name: "平方差", x2: 1, x: 0, one: -9, result: "x²-9=(x+3)(x-3)" },
        { name: "完全平方", x2: 1, x: 6, one: 9, result: "x²+6x+9=(x+3)²" }
      ]
    });
  }

  function formatLinearEquation(eq) {
    const xPart = eq.a === 1 ? "x" : `${eq.a}x`;
    if (eq.b === 0) {
      return `${xPart} = ${eq.c}`;
    }
    return `${xPart} ${eq.b > 0 ? "+" : "-"} ${Math.abs(eq.b)} = ${eq.c}`;
  }

  function renderEquationStepBalance(model, container) {
    const equations = [
      { a: 2, b: 3, solution: 4 },
      { a: 3, b: 2, solution: 4 },
      { a: 4, b: -5, solution: 5 },
      { a: 2, b: 7, solution: 6 },
      { a: 5, b: -3, solution: 3 }
    ].map((eq) => ({ ...eq, c: eq.a * eq.solution + eq.b }));

    let index = 0;
    let step = 0;
    let errorMessage = "";
    const { wrap, stage, controls, result } = buildShell(
      model,
      "等式天平实验台",
      "解方程时，等式两边必须同时进行相同的操作。先消去常数项，再求出一个 x 的值。"
    );

    stage.classList.add("step-balance-stage");
    const equationFocus = createEl("div", "equation-focus");
    const balance = createEl("div", "step-balance");
    const leftPan = createEl("div", "step-pan");
    const rightPan = createEl("div", "step-pan");
    const beam = createEl("div", "step-beam");
    const support = createEl("div", "step-support");
    const panRow = createEl("div", "step-pan-row");
    panRow.append(leftPan, rightPan);
    balance.append(beam, support, panRow);
    const legend = createEl("div", "equation-legend");
    legend.append(
      createEl("span", "equation-chip x-chip", "x 表示未知数"),
      createEl("span", "equation-chip unit-chip", "1 表示一个单位"),
      createEl("span", "equation-chip equal-chip", "横梁水平表示等式成立")
    );
    stage.append(equationFocus, balance, legend);

    const actionButton = makeButton("", () => {
      if (step === 0) {
        step = 1;
        errorMessage = "";
        draw();
        return;
      }
      if (step === 1) {
        step = 2;
        errorMessage = "";
      }
      draw();
    });
    const backButton = makeButton("上一步", () => {
      step = Math.max(0, step - 1);
      errorMessage = "";
      draw();
    });
    const resetButton = makeButton("重置", () => {
      step = 0;
      errorMessage = "";
      draw();
    });
    const changeButton = makeButton("换一道方程", () => {
      const previous = index;
      while (index === previous && equations.length > 1) {
        index = Math.floor(Math.random() * equations.length);
      }
      step = 0;
      errorMessage = "";
      draw();
    });
    controls.append(actionButton, backButton, changeButton, resetButton);

    function addBlocks(target, xCount, unitCount) {
      target.replaceChildren();
      const blockRow = createEl("div", "equation-block-row");
      for (let i = 0; i < xCount; i += 1) {
        blockRow.appendChild(createEl("span", "equation-block x-block", "x"));
      }
      const unitAmount = Math.abs(unitCount);
      for (let i = 0; i < unitAmount; i += 1) {
        blockRow.appendChild(createEl("span", `equation-block unit-block${unitCount < 0 ? " negative" : ""}`, unitCount < 0 ? "-1" : "1"));
      }
      target.appendChild(blockRow);
    }

    function currentState(eq) {
      if (step === 0) {
        return {
          equation: formatLinearEquation(eq),
          leftLabel: `${eq.a}x ${eq.b > 0 ? "+" : "-"} ${Math.abs(eq.b)}`,
          rightLabel: `${eq.c}`,
          leftX: eq.a,
          leftUnits: eq.b,
          rightUnits: eq.c,
          note: `当前方程：${formatLinearEquation(eq)}。左托盘是 ${eq.a} 个 x 和 ${Math.abs(eq.b)} 个${eq.b < 0 ? "负" : ""}单位块，右托盘是 ${eq.c} 个单位块。`
        };
      }
      if (step === 1) {
        return {
          equation: `${eq.a}x = ${eq.c - eq.b}`,
          leftLabel: `${eq.a}x`,
          rightLabel: `${eq.c - eq.b}`,
          leftX: eq.a,
          leftUnits: 0,
          rightUnits: eq.c - eq.b,
          note: `两边同时${eq.b > 0 ? `减 ${eq.b}` : `加 ${Math.abs(eq.b)}`}，等式仍然成立，得到 ${eq.a}x = ${eq.c - eq.b}。`
        };
      }
      return {
        equation: `x = ${eq.solution}`,
        leftLabel: "x",
        rightLabel: `${eq.solution}`,
        leftX: 1,
        leftUnits: 0,
        rightUnits: eq.solution,
        note: `两边同时除以 ${eq.a}，得到一个 x 的值：x = ${eq.solution}。`
      };
    }

    function renderVerification(eq) {
      const panel = createEl("div", "verify-panel");
      const label = createEl("label", "custom-slider");
      const valueEl = createEl("strong", "", String(eq.solution));
      const input = document.createElement("input");
      const readout = createEl("p", "verify-readout");
      input.type = "range";
      input.min = String(eq.solution - 4);
      input.max = String(eq.solution + 4);
      input.step = "1";
      input.value = String(eq.solution);

      function update() {
        const value = Number(input.value);
        const left = eq.a * value + eq.b;
        valueEl.textContent = String(value);
        readout.textContent = left === eq.c
          ? `左边 = ${eq.a} × ${value} ${eq.b >= 0 ? "+" : "-"} ${Math.abs(eq.b)} = ${left}；右边 = ${eq.c}。左右相等，x = ${value} 是方程的解。`
          : `左边 = ${eq.a} × ${value} ${eq.b >= 0 ? "+" : "-"} ${Math.abs(eq.b)} = ${left}；右边 = ${eq.c}。左右不相等，继续尝试。`;
      }

      input.addEventListener("input", update);
      const head = createEl("span", "custom-slider-label");
      head.append(createEl("span", "", "验证 x 的值"), valueEl);
      label.append(head, input);
      panel.append(createEl("strong", "", "验证答案"), label, readout);
      update();
      return panel;
    }

    function draw() {
      const eq = equations[index];
      const state = currentState(eq);
      equationFocus.innerHTML = `<strong>当前方程：</strong><span>${state.equation}</span>`;
      actionButton.textContent = step === 0
        ? (eq.b > 0 ? `下一步：两边同时减 ${eq.b}` : `下一步：两边同时加 ${Math.abs(eq.b)}`)
        : step === 1
          ? `下一步：两边同时除以 ${eq.a}`
          : "已完成";
      actionButton.disabled = step === 2;
      addBlocks(leftPan, state.leftX, state.leftUnits);
      addBlocks(rightPan, 0, state.rightUnits);
      leftPan.insertBefore(createEl("strong", "pan-label", `左托盘：${state.leftLabel}`), leftPan.firstChild);
      rightPan.insertBefore(createEl("strong", "pan-label", `右托盘：${state.rightLabel}`), rightPan.firstChild);

      result.replaceChildren();
      result.appendChild(createEl("strong", "", step === 2 ? `方程的解：x = ${eq.solution}` : "解题过程"));
      result.appendChild(createEl("p", "", errorMessage || state.note));
      if (step === 2) {
        const summary = createEl("div", "solution-summary");
        summary.append(
          createEl("span", "", formatLinearEquation(eq)),
          createEl("span", "", `${eq.a}x = ${eq.c - eq.b}`),
          createEl("span", "", `x = ${eq.solution}`)
        );
        result.append(createEl("p", "", "你刚才完成了："), summary, renderVerification(eq));
      }
    }

    draw();
    container.appendChild(wrap);
  }


  function renderFractionBars(model, container) {
    const radicalMode = model.id === "quadratic-radical";
    let numerator = 2;
    let denominator = 5;
    let radicand = 12;
    const { wrap, stage, controls, result } = buildShell(
      model,
      radicalMode ? "根式化简条" : "分式条形图",
      radicalMode ? "拖动被开方数，观察根式能否提出平方因子。" : "拖动分子和分母，观察分式表示的部分与整体。"
    );
    const bars = createEl("div", "fraction-bars");
    stage.appendChild(bars);

    function draw() {
      bars.replaceChildren();

      if (radicalMode) {
        const factor = Math.floor(Math.sqrt(radicand));
        let outside = 1;
        let inside = radicand;
        for (let i = factor; i >= 2; i -= 1) {
          if (radicand % (i * i) === 0) {
            outside = i;
            inside = radicand / (i * i);
            break;
          }
        }
        const fill = createEl("div", "bar-fill radical-fill");
        fill.style.width = `${Math.min(100, (Math.sqrt(radicand) / 10) * 100)}%`;
        bars.appendChild(fill);
        result.textContent = outside > 1 ? `√${radicand} = ${outside}√${inside}` : `√${radicand} 暂时不能提出大于 1 的整数平方因子。`;
        return;
      }

      const value = numerator / denominator;
      for (let i = 0; i < denominator; i += 1) {
        const part = createEl("span", `fraction-part${i < numerator ? " filled" : ""}`);
        bars.appendChild(part);
      }
      result.textContent = `当前分式：${numerator}/${denominator} = ${round(value)}。彩色部分表示分子，全部小格表示分母。`;
    }

    if (radicalMode) {
      controls.appendChild(makeRange("被开方数", 2, 80, 1, radicand, (value) => {
        radicand = value;
        draw();
      }));
    } else {
      controls.appendChild(makeRange("分子", 1, 10, 1, numerator, (value) => {
        numerator = Math.min(value, denominator);
        draw();
      }));
      controls.appendChild(makeRange("分母", 2, 12, 1, denominator, (value) => {
        denominator = value;
        numerator = Math.min(numerator, denominator);
        draw();
      }));
    }

    draw();
    container.appendChild(wrap);
  }

  function renderAngleLines(model, container) {
    let angle = 60;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "角度实验",
      "拖动角度，观察锐角、直角、钝角和补角之间的关系。"
    );
    const svg = createSvg({ viewBox: "0 0 640 260", class: "custom-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      const ox = 300;
      const oy = 190;
      const len = 180;
      const rad = (angle * Math.PI) / 180;
      const x = ox + Math.cos(rad) * len;
      const y = oy - Math.sin(rad) * len;
      svg.appendChild(createSvgEl("line", { x1: 90, y1: oy, x2: 560, y2: oy, class: "axis-line" }));
      svg.appendChild(createSvgEl("line", { x1: ox, y1: oy, x2: x, y2: y, class: "measure-line" }));
      svg.appendChild(createSvgEl("path", { d: `M ${ox + 56} ${oy} A 56 56 0 0 0 ${ox + Math.cos(rad) * 56} ${oy - Math.sin(rad) * 56}`, class: "curve-line" }));
      svg.appendChild(createSvgEl("circle", { cx: ox, cy: oy, r: 7, class: "custom-point" }));
      svg.appendChild(createSvgEl("text", { x: ox + 42, y: oy - 22, class: "custom-svg-label" }, `${angle}°`));
      const type = angle < 90 ? "锐角" : angle === 90 ? "直角" : "钝角";
      result.textContent = `当前角是 ${angle}°，属于${type}；它的邻补角是 ${180 - angle}°。`;
    }

    controls.appendChild(makeRange("角度", 10, 170, 1, angle, (value) => {
      angle = value;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderSymmetryMirror(model, container) {
    let x = 3;
    let y = 1;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "轴对称镜面",
      "拖动左侧点，右侧点会始终保持到对称轴的距离相等。"
    );
    const svg = createSvg({ viewBox: "0 0 640 300", class: "custom-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      const cx = 320;
      const cy = 150;
      const scale = 36;
      const px = cx - x * scale;
      const py = cy - y * scale;
      const mx = cx + x * scale;
      svg.appendChild(createSvgEl("line", { x1: cx, y1: 28, x2: cx, y2: 272, class: "axis-line dashed" }));
      svg.appendChild(createSvgEl("line", { x1: px, y1: py, x2: mx, y2: py, class: "measure-line dashed" }));
      svg.appendChild(createSvgEl("circle", { cx: px, cy: py, r: 10, class: "custom-point" }));
      svg.appendChild(createSvgEl("circle", { cx: mx, cy: py, r: 10, class: "custom-point warm" }));
      svg.appendChild(createSvgEl("text", { x: px - 34, y: py - 16, class: "custom-svg-label" }, `A(-${x}, ${y})`));
      svg.appendChild(createSvgEl("text", { x: mx + 12, y: py - 16, class: "custom-svg-label" }, `A'(${x}, ${y})`));
      result.textContent = `关于 y 轴对称时，纵坐标不变，横坐标变为相反数：A(-${x}, ${y}) → A'(${x}, ${y})。`;
    }

    controls.appendChild(makeRange("离对称轴距离", 1, 6, 1, x, (value) => {
      x = value;
      draw();
    }));
    controls.appendChild(makeRange("高度", -3, 4, 1, y, (value) => {
      y = value;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderShapeArea(model, container) {
    let base = model.id === "square" ? 5 : 7;
    let height = model.id === "square" ? 5 : 4;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "面积模型",
      "拖动底、高或边长，看看面积与周长如何一起变化。"
    );
    const svg = createSvg({ viewBox: "0 0 640 300", class: "custom-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      const sx = 34;
      const w = Math.max(70, base * sx);
      const h = Math.max(60, height * sx);
      const x = 320 - w / 2;
      const y = 164 - h / 2;
      let points = "";

      if (model.id === "isosceles-triangle") {
        points = `${x},${y + h} ${x + w},${y + h} ${x + w / 2},${y}`;
      } else if (model.id === "parallelogram" || model.id === "rhombus") {
        points = `${x + 42},${y} ${x + w},${y} ${x + w - 42},${y + h} ${x},${y + h}`;
      } else {
        points = `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
      }

      svg.appendChild(createSvgEl("polygon", { points, class: "shape-fill" }));
      svg.appendChild(createSvgEl("polygon", { points, class: "shape-outline" }));
      svg.appendChild(createSvgEl("text", { x: 34, y: 36, class: "custom-svg-label" }, `底/边 = ${base}`));
      svg.appendChild(createSvgEl("text", { x: 34, y: 62, class: "custom-svg-label" }, `高 = ${height}`));

      const area = model.id === "isosceles-triangle" ? (base * height) / 2 : base * height;
      const perimeter = model.id === "square" ? base * 4 : 2 * (base + height);
      result.textContent = `面积 = ${round(area)}，参考周长 = ${round(perimeter)}。${model.id === "isosceles-triangle" ? "三角形面积要再除以 2。" : "平行四边形和矩形都可以用底 × 高求面积。"}`;
    }

    controls.appendChild(makeRange(model.id === "square" ? "边长" : "底", 2, 12, 1, base, (value) => {
      base = value;
      if (model.id === "square") {
        height = value;
      }
      draw();
    }));

    if (model.id !== "square") {
      controls.appendChild(makeRange("高", 2, 9, 1, height, (value) => {
        height = value;
        draw();
      }));
    }

    draw();
    container.appendChild(wrap);
  }

  function dataStats(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const median = (sorted[3] + sorted[4]) / 2;
    const counts = new Map();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    const mode = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    return { mean, median, mode, variance };
  }

  function renderDataChart(model, container) {
    let values = [8, 12, 15, 10, 16, 13, 9, 18];
    const { wrap, stage, controls, result } = buildShell(
      model,
      "数据实验室",
      "多生成几组数据，观察平均数、中位数、众数和方差的变化。"
    );
    const chart = createEl("div", "bar-chart");
    stage.appendChild(chart);

    function randomize() {
      values = Array.from({ length: 8 }, () => Math.floor(Math.random() * 18) + 3);
      draw();
    }

    function draw() {
      chart.replaceChildren();
      const max = Math.max(...values);
      values.forEach((value) => {
        const bar = createEl("span", "data-bar");
        bar.style.height = `${Math.max(18, (value / max) * 150)}px`;
        bar.textContent = value;
        chart.appendChild(bar);
      });
      const stats = dataStats(values);
      result.textContent = `数据：${values.join("，")}。平均数=${round(stats.mean)}，中位数=${round(stats.median)}，众数=${stats.mode}，方差=${round(stats.variance)}。`;
    }

    controls.appendChild(makeButton("随机生成数据", randomize));
    draw();
    container.appendChild(wrap);
  }

  function renderProbabilitySimulator(model, container) {
    let red = 4;
    let white = 6;
    let trials = 0;
    let redHits = 0;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "概率模拟器",
      "实验次数越多，红球出现频率通常越接近理论概率。"
    );
    const balls = createEl("div", "ball-bag");
    stage.appendChild(balls);

    function drawBalls() {
      balls.replaceChildren();
      Array.from({ length: red }).forEach(() => balls.appendChild(createEl("span", "ball red-ball")));
      Array.from({ length: white }).forEach(() => balls.appendChild(createEl("span", "ball white-ball")));
      const theoretical = red / (red + white);
      const frequency = trials > 0 ? redHits / trials : 0;
      result.textContent = `理论概率 P(红球)= ${red}/${red + white} ≈ ${round(theoretical)}。已模拟 ${trials} 次，摸到红球 ${redHits} 次，频率≈${round(frequency)}。`;
    }

    controls.appendChild(makeRange("红球数量", 1, 10, 1, red, (value) => {
      red = value;
      trials = 0;
      redHits = 0;
      drawBalls();
    }));
    controls.appendChild(makeRange("白球数量", 1, 10, 1, white, (value) => {
      white = value;
      trials = 0;
      redHits = 0;
      drawBalls();
    }));
    controls.appendChild(makeButton("模拟摸球", () => {
      trials += 1;
      if (Math.random() < red / (red + white)) {
        redHits += 1;
      }
      drawBalls();
    }));
    drawBalls();
    container.appendChild(wrap);
  }

  function renderFunctionMiniGraph(model, container) {
    const inverseMode = model.id === "inverse-function";
    let k = 4;
    let p = -3;
    let q = 2;
    const { wrap, stage, controls, result } = buildShell(
      model,
      inverseMode ? "反比例函数小图" : "二次方程图像",
      "拖动参数，观察图像形状和关键点如何改变。"
    );
    const svg = createSvg({ viewBox: "0 0 640 330", class: "custom-svg" });
    stage.appendChild(svg);

    function sx(x) {
      return 320 + x * 36;
    }

    function sy(y) {
      return 165 - y * 24;
    }

    function pathFor(fn, start, end, step) {
      let path = "";
      for (let x = start; x <= end; x += step) {
        if (Math.abs(x) < 0.12 && inverseMode) {
          path = "";
          continue;
        }
        const y = fn(x);
        if (Math.abs(y) > 8) {
          continue;
        }
        path += path ? ` L ${sx(x)} ${sy(y)}` : `M ${sx(x)} ${sy(y)}`;
      }
      return path;
    }

    function draw() {
      svg.replaceChildren();
      svg.appendChild(createSvgEl("line", { x1: 34, y1: 165, x2: 606, y2: 165, class: "axis-line" }));
      svg.appendChild(createSvgEl("line", { x1: 320, y1: 28, x2: 320, y2: 302, class: "axis-line" }));

      if (inverseMode) {
        svg.appendChild(createSvgEl("path", { d: pathFor((x) => k / x, -8, -0.2, 0.12), class: "curve-line" }));
        svg.appendChild(createSvgEl("path", { d: pathFor((x) => k / x, 0.2, 8, 0.12), class: "curve-line" }));
        result.textContent = `当前函数：y=${k}/x。k ${k > 0 ? "大于 0，图像在第一、三象限。" : "小于 0，图像在第二、四象限。"}`;
        return;
      }

      const discriminant = p * p - 4 * q;
      svg.appendChild(createSvgEl("path", { d: pathFor((x) => x * x + p * x + q, -8, 8, 0.12), class: "curve-line" }));
      result.textContent = `当前方程：x² ${p >= 0 ? "+" : ""}${p}x ${q >= 0 ? "+" : ""}${q}=0。判别式 Δ=${round(discriminant)}，${discriminant > 0 ? "有两个不相等实根。" : discriminant === 0 ? "有两个相等实根。" : "没有实数根。"}`;
    }

    if (inverseMode) {
      controls.appendChild(makeRange("k", -8, 8, 1, k, (value) => {
        k = value || 1;
        draw();
      }));
    } else {
      controls.appendChild(makeRange("p", -8, 8, 1, p, (value) => {
        p = value;
        draw();
      }));
      controls.appendChild(makeRange("q", -8, 8, 1, q, (value) => {
        q = value;
        draw();
      }));
    }

    draw();
    container.appendChild(wrap);
  }

  function renderTriangleRatio(model, container) {
    const trigMode = model.id === "trigonometry";
    let scale = 1.5;
    let angle = 35;
    const { wrap, stage, controls, result } = buildShell(
      model,
      trigMode ? "直角三角函数" : "三角形比例尺",
      trigMode ? "拖动锐角，观察正弦、余弦、正切的比值变化。" : "拖动比例，观察两个三角形对应边如何同时变化。"
    );
    const svg = createSvg({ viewBox: "0 0 640 310", class: "custom-svg" });
    stage.appendChild(svg);

    function drawTriangle(points, className) {
      svg.appendChild(createSvgEl("polygon", { points, class: `shape-fill ${className}` }));
      svg.appendChild(createSvgEl("polygon", { points, class: "shape-outline" }));
    }

    function draw() {
      svg.replaceChildren();
      if (trigMode) {
        const base = 220;
        const rad = (angle * Math.PI) / 180;
        const height = Math.tan(rad) * base;
        drawTriangle(`160,250 ${380},250 380,${250 - height}`, "warm-fill");
        result.textContent = `角 A=${angle}°。sin≈${round(Math.sin(rad))}，cos≈${round(Math.cos(rad))}，tan≈${round(Math.tan(rad))}。`;
        return;
      }

      drawTriangle("80,230 230,230 150,110", "");
      const x = 350;
      const w = 150 * scale;
      const h = 120 * scale;
      drawTriangle(`${x},230 ${x + w},230 ${x + 70 * scale},${230 - h}`, "warm-fill");
      result.textContent = `相似比 = ${round(scale)}。对应角相等，对应边成比例；右侧三角形的边长都是左侧的 ${round(scale)} 倍。`;
    }

    if (trigMode) {
      controls.appendChild(makeRange("锐角 A", 15, 75, 1, angle, (value) => {
        angle = value;
        draw();
      }));
    } else {
      controls.appendChild(makeRange("比例", 0.8, 2.2, 0.1, scale, (value) => {
        scale = value;
        draw();
      }));
    }

    draw();
    container.appendChild(wrap);
  }

  function renderView3d(model, container) {
    let view = "front";
    const labels = {
      front: "主视图",
      left: "左视图",
      top: "俯视图"
    };
    const { wrap, stage, controls, result } = buildShell(
      model,
      "三视图切换",
      "从不同方向观察同一个立体图形，平面图形会发生变化。"
    );
    const cube = createEl("div", "view-3d-stage");
    const projection = createEl("div", "projection-card");
    stage.append(cube, projection);

    function draw() {
      cube.innerHTML = `
        <div class="cube-face front-face"></div>
        <div class="cube-face side-face"></div>
        <div class="cube-face top-face"></div>
      `;
      projection.className = `projection-card view-${view}`;
      projection.textContent = labels[view];
      result.textContent = `当前观察方向：${labels[view]}。主视图看长和高，左视图看宽和高，俯视图看长和宽。`;
    }

    Object.entries(labels).forEach(([key, label]) => {
      controls.appendChild(makeButton(label, () => {
        view = key;
        draw();
      }));
    });

    draw();
    container.appendChild(wrap);
  }

  function addLabHeading(stage, title, question) {
    const heading = createEl("div", "lab-task");
    heading.append(createEl("strong", "", title), createEl("span", "", question));
    stage.appendChild(heading);
    return heading;
  }

  function addButtonGroup(parent, buttons) {
    const group = createEl("div", "lab-button-row");
    buttons.forEach((button) => group.appendChild(button));
    parent.appendChild(group);
    return group;
  }

  function setActiveButton(buttons, activeIndex) {
    buttons.forEach((button, index) => button.classList.toggle("is-active", index === activeIndex));
  }

  function renderAxis(svg, min, max, y = 118) {
    svg.appendChild(createSvgEl("line", { x1: 38, y1: y, x2: 602, y2: y, class: "axis-line" }));
    svg.appendChild(createSvgEl("polygon", { points: `602,${y} 590,${y - 6} 590,${y + 6}`, class: "axis-arrow" }));
    for (let value = min; value <= max; value += 1) {
      const x = 54 + ((value - min) / (max - min)) * 532;
      svg.appendChild(createSvgEl("line", { x1: x, y1: y - 8, x2: x, y2: y + 8, class: "tick-line" }));
      if (value % 2 === 0 || max - min <= 12) {
        svg.appendChild(createSvgEl("text", { x, y: y + 32, class: "custom-svg-label", "text-anchor": "middle" }, String(value)));
      }
    }
  }

  function axisPosition(value, min, max) {
    return 54 + ((value - min) / (max - min)) * 532;
  }

  function renderRationalNumberLab(model, container) {
    let a = -3;
    let b = 4;
    let mode = "compare";
    const { wrap, stage, controls, result } = buildShell(
      model,
      "有理数数轴实验台",
      "绝对值表示一个数到 0 的距离；加减法可以理解为在数轴上向左或向右移动。"
    );
    addLabHeading(stage, "当前任务", "拖动 A、B，观察大小比较、绝对值和有理数加减。");
    const svg = createSvg({ viewBox: "0 0 640 260", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      renderAxis(svg, -10, 10, 132);
      const xA = axisPosition(a, -10, 10);
      const xB = axisPosition(b, -10, 10);
      const x0 = axisPosition(0, -10, 10);
      svg.appendChild(createSvgEl("line", { x1: x0, y1: 102, x2: xA, y2: 102, class: "measure-line" }));
      svg.appendChild(createSvgEl("line", { x1: x0, y1: 162, x2: xB, y2: 162, class: "curve-line" }));
      svg.appendChild(createSvgEl("circle", { cx: xA, cy: 132, r: 10, class: "custom-point" }));
      svg.appendChild(createSvgEl("circle", { cx: xB, cy: 132, r: 10, class: "custom-point warm" }));
      svg.appendChild(createSvgEl("text", { x: xA, y: 84, class: "custom-svg-label", "text-anchor": "middle" }, `A=${a}`));
      svg.appendChild(createSvgEl("text", { x: xB, y: 198, class: "custom-svg-label", "text-anchor": "middle" }, `B=${b}`));

      if (mode !== "compare") {
        const target = mode === "add" ? a + b : a - b;
        const from = axisPosition(a, -10, 10);
        const to = axisPosition(Math.max(-10, Math.min(10, target)), -10, 10);
        svg.appendChild(createSvgEl("path", { d: `M ${from} 54 Q ${(from + to) / 2} 18 ${to} 54`, class: "curve-line" }));
        svg.appendChild(createSvgEl("polygon", { points: `${to},54 ${to - 10},49 ${to - 7},60`, class: "axis-arrow" }));
        svg.appendChild(createSvgEl("text", { x: Math.min(580, Math.max(70, to)), y: 36, class: "custom-svg-label", "text-anchor": "middle" }, `${mode === "add" ? "A+B" : "A-B"}=${target}`));
      }

      const compare = a > b ? ">" : a < b ? "<" : "=";
      const operationText = mode === "add"
        ? `演示加法：从 A=${a} 出发，${b >= 0 ? "向右" : "向左"}移动 ${Math.abs(b)} 格，得到 A+B=${a + b}。`
        : mode === "subtract"
          ? `演示减法：A-B 等于加上 B 的相反数，从 ${a} 移动到 ${a - b}。`
          : `大小比较：A ${compare} B。绝对值：|A|=${Math.abs(a)}，|B|=${Math.abs(b)}。`;
      result.innerHTML = `<strong>实时结果</strong><p>A=${a}，B=${b}，${operationText}</p>`;
    }

    controls.appendChild(makeRange("点 A", -10, 10, 1, a, (value) => {
      a = value;
      draw();
    }));
    controls.appendChild(makeRange("点 B", -10, 10, 1, b, (value) => {
      b = value;
      draw();
    }));
    const buttons = [
      makeButton("比较大小", () => {
        mode = "compare";
        setActiveButton(buttons, 0);
        draw();
      }),
      makeButton("演示加法", () => {
        mode = "add";
        setActiveButton(buttons, 1);
        draw();
      }),
      makeButton("演示减法", () => {
        mode = "subtract";
        setActiveButton(buttons, 2);
        draw();
      }),
      makeButton("重置", () => {
        a = -3;
        b = 4;
        mode = "compare";
        setActiveButton(buttons, 0);
        draw();
      })
    ];
    addButtonGroup(controls, buttons);
    setActiveButton(buttons, 0);
    draw();
    container.appendChild(wrap);
  }

  function renderGeometryBasicsBuilder(model, container) {
    const modes = ["直线", "射线", "线段", "角"];
    let modeIndex = 2;
    let length = 7;
    let angle = 60;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "点线角构造实验台",
      "直线没有端点，射线有一个端点，线段有两个端点；角由两条有公共端点的射线组成。"
    );
    addLabHeading(stage, "当前任务", "切换图形类型，观察端点、箭头、长度和角度分类。");
    const svg = createSvg({ viewBox: "0 0 640 300", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      const mode = modes[modeIndex];
      const cx = 320;
      const cy = 160;
      const half = length * 26;
      if (mode === "角") {
        const rad = (angle * Math.PI) / 180;
        const x = cx + Math.cos(rad) * 180;
        const y = cy - Math.sin(rad) * 180;
        svg.appendChild(createSvgEl("line", { x1: cx, y1: cy, x2: cx + 190, y2: cy, class: "axis-line" }));
        svg.appendChild(createSvgEl("line", { x1: cx, y1: cy, x2: x, y2: y, class: "measure-line" }));
        svg.appendChild(createSvgEl("polygon", { points: `${cx + 190},${cy} ${cx + 178},${cy - 6} ${cx + 178},${cy + 6}`, class: "axis-arrow" }));
        svg.appendChild(createSvgEl("polygon", { points: `${x},${y} ${x - 10},${y - 2} ${x - 4},${y + 9}`, class: "axis-arrow" }));
        svg.appendChild(createSvgEl("path", { d: `M ${cx + 48} ${cy} A 48 48 0 0 0 ${cx + Math.cos(rad) * 48} ${cy - Math.sin(rad) * 48}`, class: "curve-line" }));
        svg.appendChild(createSvgEl("circle", { cx, cy, r: 8, class: "custom-point" }));
        svg.appendChild(createSvgEl("text", { x: cx + 52, y: cy - 26, class: "custom-svg-label" }, `${angle}°`));
        const type = angle < 90 ? "锐角" : angle === 90 ? "直角" : angle < 180 ? "钝角" : "平角";
        result.innerHTML = `<strong>实时结果</strong><p>当前是${type}。角的大小由两条射线张开的程度决定。</p>`;
        return;
      }
      const x1 = cx - half;
      const x2 = cx + half;
      svg.appendChild(createSvgEl("line", { x1, y1: cy, x2, y2: cy, class: "measure-line" }));
      if (mode === "直线") {
        svg.appendChild(createSvgEl("polygon", { points: `${x1},${cy} ${x1 + 12},${cy - 6} ${x1 + 12},${cy + 6}`, class: "axis-arrow" }));
        svg.appendChild(createSvgEl("polygon", { points: `${x2},${cy} ${x2 - 12},${cy - 6} ${x2 - 12},${cy + 6}`, class: "axis-arrow" }));
      } else if (mode === "射线") {
        svg.appendChild(createSvgEl("circle", { cx: x1, cy, r: 8, class: "custom-point" }));
        svg.appendChild(createSvgEl("polygon", { points: `${x2},${cy} ${x2 - 12},${cy - 6} ${x2 - 12},${cy + 6}`, class: "axis-arrow" }));
      } else {
        svg.appendChild(createSvgEl("circle", { cx: x1, cy, r: 8, class: "custom-point" }));
        svg.appendChild(createSvgEl("circle", { cx: x2, cy, r: 8, class: "custom-point warm" }));
      }
      svg.appendChild(createSvgEl("text", { x: cx, y: cy + 42, class: "custom-svg-label", "text-anchor": "middle" }, `${mode}：${mode === "线段" ? `长度约 ${length}` : "按箭头方向延伸"}`));
      const text = mode === "直线" ? "直线向两边无限延伸，没有端点。" : mode === "射线" ? "射线从端点出发，向一方无限延伸。" : "线段有两个端点，可以测量长度。";
      result.innerHTML = `<strong>实时结果</strong><p>${text}</p>`;
    }

    const switchModeButton = makeButton("", () => {
      modeIndex = (modeIndex + 1) % modes.length;
      draw();
    });
    controls.appendChild(switchModeButton);
    controls.appendChild(makeRange("线段长度 / 线宽", 3, 9, 1, length, (value) => {
      length = value;
      draw();
    }));
    controls.appendChild(makeRange("角度", 10, 180, 5, angle, (value) => {
      angle = value;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      modeIndex = 2;
      length = 7;
      angle = 60;
      draw();
    }));
    const originalDraw = draw;
    draw = function drawWithModeButton() {
      switchModeButton.textContent = `切换图形：${modes[modeIndex]}`;
      originalDraw();
    };
    draw();
    container.appendChild(wrap);
  }

  function renderRealNumberClassifier(model, container) {
    const cards = [
      { label: "3", value: 3, category: "自然数", note: "3 是自然数，也是整数、有理数和实数。" },
      { label: "-5", value: -5, category: "整数", note: "-5 是整数，也是有理数和实数。" },
      { label: "1/2", value: 0.5, category: "有理数", note: "1/2 能写成分数，是有理数。" },
      { label: "0.25", value: 0.25, category: "有理数", note: "0.25 是有限小数，能写成 1/4。" },
      { label: "√2", value: Math.sqrt(2), category: "无理数", note: "√2 是无限不循环小数，是无理数。" },
      { label: "π", value: Math.PI, category: "无理数", note: "π 是无限不循环小数，是无理数。" },
      { label: "√9", value: 3, category: "自然数", note: "√9=3，所以它属于自然数。" }
    ];
    let cardIndex = 0;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "实数分类实验台",
      "有理数能写成两个整数的比；无理数是无限不循环小数，二者都属于实数。"
    );
    addLabHeading(stage, "当前任务", "判断数字卡片属于哪一类，并观察它在数轴上的近似位置。");
    const card = createEl("div", "number-card big-number-card");
    const svg = createSvg({ viewBox: "0 0 640 180", class: "custom-svg lab-svg" });
    const setBox = createEl("div", "set-relation");
    setBox.innerHTML = "<span>自然数</span><span>整数</span><span>有理数</span><span>实数</span><span>无理数也属于实数</span>";
    stage.append(card, setBox, svg);

    function draw(message = "请选择一个分类。") {
      const item = cards[cardIndex];
      card.textContent = item.label;
      svg.replaceChildren();
      renderAxis(svg, -6, 6, 88);
      const x = axisPosition(Math.max(-6, Math.min(6, item.value)), -6, 6);
      svg.appendChild(createSvgEl("circle", { cx: x, cy: 88, r: 10, class: "custom-point warm" }));
      svg.appendChild(createSvgEl("text", { x, y: 52, class: "custom-svg-label", "text-anchor": "middle" }, `${item.label}≈${round(item.value, 3)}`));
      result.innerHTML = `<strong>实时结果</strong><p>${message}</p><p>${item.note}</p>`;
    }

    controls.appendChild(makeButton("判断分类", () => {
      const item = cards[cardIndex];
      draw(`${item.label} 最贴切的分类是“${item.category}”，也属于实数。`);
    }));
    controls.appendChild(makeButton("换一张数字卡片", () => {
      cardIndex = (cardIndex + 1) % cards.length;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      cardIndex = 0;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderSystemEliminationLab(model, container) {
    let method = "add";
    let step = 0;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "二元一次方程组消元实验台",
      "消元的目标是先把两个未知数变成一个未知数，再代回求另一个未知数。"
    );
    addLabHeading(stage, "当前方程组", "x + y = 7；x - y = 1");
    const svg = createSvg({ viewBox: "0 0 640 320", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function sx(x) {
      return 320 + x * 36;
    }

    function sy(y) {
      return 260 - y * 28;
    }

    function drawGraph() {
      svg.replaceChildren();
      svg.appendChild(createSvgEl("line", { x1: 40, y1: 260, x2: 600, y2: 260, class: "axis-line" }));
      svg.appendChild(createSvgEl("line", { x1: 320, y1: 32, x2: 320, y2: 290, class: "axis-line" }));
      const line1 = `M ${sx(0)} ${sy(7)} L ${sx(7)} ${sy(0)}`;
      const line2 = `M ${sx(-1)} ${sy(-2)} L ${sx(7)} ${sy(6)}`;
      svg.appendChild(createSvgEl("path", { d: line1, class: "curve-line" }));
      svg.appendChild(createSvgEl("path", { d: line2, class: "measure-line" }));
      svg.appendChild(createSvgEl("circle", { cx: sx(4), cy: sy(3), r: 9, class: "custom-point warm" }));
      svg.appendChild(createSvgEl("text", { x: sx(4) + 12, y: sy(3) - 10, class: "custom-svg-label" }, "交点 (4,3)"));
      svg.appendChild(createSvgEl("text", { x: 54, y: 38, class: "custom-svg-label" }, "蓝线：x+y=7"));
      svg.appendChild(createSvgEl("text", { x: 54, y: 64, class: "custom-svg-label" }, "黄线：x-y=1"));
    }

    function draw() {
      drawGraph();
      const steps = method === "add"
        ? ["两个方程相加：(x+y)+(x-y)=7+1", "得到 2x=8，所以 x=4", "把 x=4 代回 x+y=7，得到 y=3"]
        : ["由 x-y=1 得到 x=y+1", "代入 x+y=7：y+1+y=7", "得到 2y=6，所以 y=3，再得 x=4"];
      result.innerHTML = `<strong>${method === "add" ? "加减消元" : "代入消元"}</strong><p>${steps[Math.min(step, 2)]}</p><p>方程组的解是 x=4，y=3；图像上就是两条直线的交点。</p>`;
    }

    const switchMethodButton = makeButton("", () => {
      method = method === "add" ? "substitute" : "add";
      step = 0;
      draw();
    });
    controls.appendChild(switchMethodButton);
    controls.appendChild(makeButton("下一步", () => {
      step = Math.min(2, step + 1);
      draw();
    }));
    controls.appendChild(makeButton("上一步", () => {
      step = Math.max(0, step - 1);
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      step = 0;
      method = "add";
      draw();
    }));
    const originalDraw = draw;
    draw = function drawWithMethodButton() {
      switchMethodButton.textContent = `切换方法：${method === "add" ? "加减消元" : "代入消元"}`;
      originalDraw();
    };
    draw();
    container.appendChild(wrap);
  }

  function renderInequalityNumberLineLab(model, container) {
    const examples = [
      { text: "2x + 3 > 11", solution: "x > 4", boundary: 4, type: "open", direction: "right", steps: ["两边同时减 3：2x > 8", "两边同时除以 2：x > 4", "在数轴上画空心圆点，并向右涂色。"] },
      { text: "-3x ≤ 12", solution: "x ≥ -4", boundary: -4, type: "closed", direction: "right", steps: ["两边同时除以 -3", "除以负数时，不等号方向改变：x ≥ -4", "实心圆点表示包含 -4。"] },
      { text: "-2 < x < 3", solution: "-2 < x < 3", boundary: -2, end: 3, type: "open", direction: "between", steps: ["这是区间不等式", "两个端点都不包含", "在 -2 和 3 之间涂色。"] }
    ];
    let index = 0;
    let step = 0;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "不等式与数轴实验台",
      "画解集时，空心圆点表示不包含端点，实心圆点表示包含端点。乘除负数时不等号方向要改变。"
    );
    const task = addLabHeading(stage, "当前不等式", examples[index].text);
    const svg = createSvg({ viewBox: "0 0 640 230", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function drawNumberLine(example) {
      svg.replaceChildren();
      renderAxis(svg, -8, 8, 112);
      const startX = axisPosition(example.boundary, -8, 8);
      if (example.direction === "between") {
        const endX = axisPosition(example.end, -8, 8);
        svg.appendChild(createSvgEl("line", { x1: startX, y1: 112, x2: endX, y2: 112, class: "range-highlight" }));
        svg.appendChild(createSvgEl("circle", { cx: startX, cy: 112, r: 10, class: "custom-point hollow" }));
        svg.appendChild(createSvgEl("circle", { cx: endX, cy: 112, r: 10, class: "custom-point hollow" }));
      } else {
        const x2 = example.direction === "right" ? 592 : 54;
        svg.appendChild(createSvgEl("line", { x1: startX, y1: 112, x2, y2: 112, class: "range-highlight" }));
        svg.appendChild(createSvgEl("circle", { cx: startX, cy: 112, r: 10, class: `custom-point ${example.type === "open" ? "hollow" : ""}` }));
      }
      svg.appendChild(createSvgEl("text", { x: 320, y: 48, class: "custom-svg-label", "text-anchor": "middle" }, `解集：${example.solution}`));
    }

    function draw(extra = "") {
      const example = examples[index];
      task.querySelector("span").textContent = example.text;
      drawNumberLine(example);
      result.innerHTML = `<strong>第 ${step + 1} 步</strong><p>${example.steps[step]}</p><p>${extra || "正确操作：等式或不等式两边做同样的变形。"}</p>`;
    }

    controls.appendChild(makeButton("下一步", () => {
      step = Math.min(2, step + 1);
      draw();
    }));
    controls.appendChild(makeButton("错误演示：只改一边", () => {
      draw("错误操作：只改变一边会破坏大小关系，必须两边同时操作。");
    }));
    controls.appendChild(makeButton("换一个例子", () => {
      index = (index + 1) % examples.length;
      step = 0;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      index = 0;
      step = 0;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderSurveyChartLab(model, container) {
    let values = [12, 9, 7, 4];
    let surveyMode = "全面调查";
    const labels = ["篮球", "音乐", "阅读", "绘画"];
    const colors = ["#1d65b7", "#f0b429", "#2e86de", "#e85d75"];
    const { wrap, stage, controls, result } = buildShell(
      model,
      "数据调查与图表实验台",
      "统计表适合看具体数量，条形图适合比较多少，扇形图适合看比例。"
    );
    addLabHeading(stage, "当前任务", "模拟班级兴趣调查，观察人数、比例和扇形图圆心角。");
    const board = createEl("div", "survey-board");
    stage.appendChild(board);

    function draw() {
      const total = values.reduce((sum, value) => sum + value, 0);
      board.replaceChildren();
      const table = createEl("div", "survey-table");
      labels.forEach((label, index) => {
        const percent = values[index] / total;
        const row = createEl("div", "survey-row");
        row.innerHTML = `<span>${label}</span><strong>${values[index]} 人</strong><em>${round(percent * 100, 1)}% · ${round(percent * 360)}°</em>`;
        table.appendChild(row);
      });
      const bars = createEl("div", "survey-bars");
      labels.forEach((label, index) => {
        const bar = createEl("div", "survey-bar");
        bar.style.height = `${Math.max(20, (values[index] / Math.max(...values)) * 130)}px`;
        bar.style.background = colors[index];
        bar.textContent = label;
        bars.appendChild(bar);
      });
      const pie = createEl("div", "survey-pie");
      let start = 0;
      const gradient = labels.map((label, index) => {
        const end = start + (values[index] / total) * 360;
        const segment = `${colors[index]} ${round(start)}deg ${round(end)}deg`;
        start = end;
        return segment;
      }).join(", ");
      pie.style.background = `conic-gradient(${gradient})`;
      board.append(table, bars, pie);
      result.innerHTML = `<strong>实时结果</strong><p>${surveyMode}：共 ${total} 人。扇形图圆心角 = 某项人数 ÷ 总人数 × 360°。</p>`;
    }

    controls.appendChild(makeButton("随机调整一项", () => {
      const index = Math.floor(Math.random() * values.length);
      values[index] = Math.floor(Math.random() * 16) + 4;
      draw();
    }));
    const switchSurveyButton = makeButton("", () => {
      surveyMode = surveyMode === "全面调查" ? "抽样调查" : "全面调查";
      draw();
    });
    controls.appendChild(switchSurveyButton);
    controls.appendChild(makeButton("重置", () => {
      values = [12, 9, 7, 4];
      surveyMode = "全面调查";
      draw();
    }));
    const originalDraw = draw;
    draw = function drawWithSurveyButton() {
      switchSurveyButton.textContent = `切换方式：${surveyMode}`;
      originalDraw();
    };
    draw();
    container.appendChild(wrap);
  }

  function renderCongruenceTestLab(model, container) {
    const conditions = [
      { key: "SSS", meaning: "三边分别相等", missing: "需要确认三条对应边都相等。" },
      { key: "SAS", meaning: "两边及其夹角分别相等", missing: "必须是夹在两条边之间的角。" },
      { key: "ASA", meaning: "两角及其夹边分别相等", missing: "需要夹边也对应相等。" },
      { key: "AAS", meaning: "两角及一边分别相等", missing: "还要有一组对应边相等。" },
      { key: "HL", meaning: "直角三角形中斜边和一条直角边相等", missing: "只适用于直角三角形。" }
    ];
    let index = 0;
    let satisfied = true;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "全等三角形判定实验台",
      "全等不是看起来像，而是要满足对应边和对应角的判定条件。"
    );
    addLabHeading(stage, "当前任务", "选择判定方法，观察条件满足时两个三角形能否重合。");
    const svg = createSvg({ viewBox: "0 0 640 300", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function draw() {
      const condition = conditions[index];
      svg.replaceChildren();
      const rightOffset = satisfied ? 0 : 28;
      svg.appendChild(createSvgEl("polygon", { points: "90,230 250,230 160,90", class: "shape-fill" }));
      svg.appendChild(createSvgEl("polygon", { points: "90,230 250,230 160,90", class: "shape-outline" }));
      svg.appendChild(createSvgEl("polygon", { points: `${390 + rightOffset},230 ${550 + rightOffset},230 ${460 + rightOffset},90`, class: "shape-fill warm-fill" }));
      svg.appendChild(createSvgEl("polygon", { points: `${390 + rightOffset},230 ${550 + rightOffset},230 ${460 + rightOffset},90`, class: "shape-outline" }));
      svg.appendChild(createSvgEl("text", { x: 95, y: 68, class: "custom-svg-label" }, "△ABC"));
      svg.appendChild(createSvgEl("text", { x: 390, y: 68, class: "custom-svg-label" }, "△A'B'C'"));
      svg.appendChild(createSvgEl("text", { x: 320, y: 44, class: "custom-svg-label", "text-anchor": "middle" }, satisfied ? "条件满足：可重合" : "条件不足：不能判定全等"));
      result.innerHTML = `<strong>${condition.key}</strong><p>${condition.meaning}。</p><p>${satisfied ? "满足该条件时，两个三角形可以通过平移、旋转或翻折重合，所以全等。" : condition.missing}</p>`;
    }

    const switchConditionButton = makeButton("", () => {
      index = (index + 1) % conditions.length;
      draw();
    });
    controls.appendChild(switchConditionButton);
    controls.appendChild(makeButton("切换满足/缺少条件", () => {
      satisfied = !satisfied;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      index = 0;
      satisfied = true;
      draw();
    }));
    const originalDraw = draw;
    draw = function drawWithConditionButton() {
      switchConditionButton.textContent = `切换判定：${conditions[index].key}`;
      originalDraw();
    };
    draw();
    container.appendChild(wrap);
  }

  function renderSymmetryMirrorLab(model, container) {
    const axes = ["竖直对称轴", "水平对称轴", "斜对称轴"];
    let axisIndex = 0;
    let x = 3;
    let y = 2;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "轴对称镜像实验台",
      "对应点连线被对称轴垂直平分，对应点到对称轴的距离相等。"
    );
    addLabHeading(stage, "当前任务", "移动原点 A，观察对称点 A' 怎样同步变化。");
    const svg = createSvg({ viewBox: "0 0 640 320", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      const cx = 320;
      const cy = 160;
      const scale = 34;
      let ax = cx - x * scale;
      let ay = cy - y * scale;
      let bx = cx + x * scale;
      let by = ay;
      if (axisIndex === 1) {
        ax = cx + x * scale;
        ay = cy - y * scale;
        bx = ax;
        by = cy + y * scale;
      } else if (axisIndex === 2) {
        ax = cx - x * scale;
        ay = cy - y * scale;
        bx = cx + y * scale;
        by = cy + x * scale;
      }
      if (axisIndex === 0) {
        svg.appendChild(createSvgEl("line", { x1: cx, y1: 28, x2: cx, y2: 292, class: "axis-line dashed" }));
      } else if (axisIndex === 1) {
        svg.appendChild(createSvgEl("line", { x1: 54, y1: cy, x2: 586, y2: cy, class: "axis-line dashed" }));
      } else {
        svg.appendChild(createSvgEl("line", { x1: 120, y1: 280, x2: 520, y2: 40, class: "axis-line dashed" }));
      }
      svg.appendChild(createSvgEl("line", { x1: ax, y1: ay, x2: bx, y2: by, class: "measure-line dashed" }));
      svg.appendChild(createSvgEl("circle", { cx: ax, cy: ay, r: 10, class: "custom-point" }));
      svg.appendChild(createSvgEl("circle", { cx: bx, cy: by, r: 10, class: "custom-point warm" }));
      svg.appendChild(createSvgEl("text", { x: ax - 34, y: ay - 12, class: "custom-svg-label" }, "A 原点"));
      svg.appendChild(createSvgEl("text", { x: bx + 12, y: by - 12, class: "custom-svg-label" }, "A' 对称点"));
      result.innerHTML = `<strong>实时结果</strong><p>当前：${axes[axisIndex]}。A 与 A' 到对称轴距离相等，对称轴是 AA' 的垂直平分线。</p>`;
    }

    const switchAxisButton = makeButton("", () => {
      axisIndex = (axisIndex + 1) % axes.length;
      draw();
    });
    controls.appendChild(switchAxisButton);
    controls.appendChild(makeRange("横向距离", 1, 5, 1, x, (value) => {
      x = value;
      draw();
    }));
    controls.appendChild(makeRange("高度", -3, 4, 1, y, (value) => {
      y = value;
      draw();
    }));
    controls.appendChild(makeButton("找出对称点", () => {
      result.innerHTML += "<p>练习：先从原点向对称轴作垂线，再在另一侧取相同距离，就是对称点。</p>";
    }));
    const originalDraw = draw;
    draw = function drawWithAxisButton() {
      switchAxisButton.textContent = `切换对称轴：${axes[axisIndex]}`;
      originalDraw();
    };
    draw();
    container.appendChild(wrap);
  }

  function renderIsoscelesTriangleLab(model, container) {
    let height = 5;
    let showLines = true;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "等腰三角形性质实验台",
      "等边对等角；在等腰三角形中，顶角平分线、底边中线和底边上的高重合。"
    );
    addLabHeading(stage, "当前任务", "拖动顶点高度，观察两条腰、两个底角和三线合一。");
    const svg = createSvg({ viewBox: "0 0 640 320", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      const base = 240;
      const h = height * 28;
      const ax = 200;
      const bx = ax + base;
      const ay = 250;
      const cx = 320;
      const cy = ay - h;
      const side = Math.sqrt(Math.pow(base / 2, 2) + h * h) / 28;
      const baseAngle = Math.atan2(h, base / 2) * 180 / Math.PI;
      svg.appendChild(createSvgEl("polygon", { points: `${ax},${ay} ${bx},${ay} ${cx},${cy}`, class: "shape-fill" }));
      svg.appendChild(createSvgEl("polygon", { points: `${ax},${ay} ${bx},${ay} ${cx},${cy}`, class: "shape-outline" }));
      if (showLines) {
        svg.appendChild(createSvgEl("line", { x1: cx, y1: cy, x2: cx, y2: ay, class: "measure-line dashed" }));
        svg.appendChild(createSvgEl("text", { x: cx + 10, y: (cy + ay) / 2, class: "custom-svg-label" }, "高 / 中线 / 角平分线"));
      }
      svg.appendChild(createSvgEl("text", { x: ax - 20, y: ay + 28, class: "custom-svg-label" }, `${round(baseAngle)}°`));
      svg.appendChild(createSvgEl("text", { x: bx - 20, y: ay + 28, class: "custom-svg-label" }, `${round(baseAngle)}°`));
      svg.appendChild(createSvgEl("text", { x: 320, y: 36, class: "custom-svg-label", "text-anchor": "middle" }, `两腰相等：${round(side)} = ${round(side)}`));
      result.innerHTML = `<strong>实时结果</strong><p>两个底角都约为 ${round(baseAngle)}°，所以等腰三角形体现“等边对等角”。</p>`;
    }

    controls.appendChild(makeRange("顶点高度", 3, 8, 1, height, (value) => {
      height = value;
      draw();
    }));
    controls.appendChild(makeButton("显示/隐藏三线合一", () => {
      showLines = !showLines;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      height = 5;
      showLines = true;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderPolynomialAreaMultiply(model, container) {
    let m = 2;
    let n = 3;
    let step = 0;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "整式乘法面积实验台",
      "矩形面积等于长乘宽，把边长拆成 x 和常数，就能看到分配律。"
    );
    addLabHeading(stage, "当前任务", "用面积模型展开 (x + m)(x + n)。");
    const grid = createEl("div", "poly-area-grid");
    stage.appendChild(grid);

    function draw() {
      grid.innerHTML = `
        <div class="area-cell area-x2">x²</div>
        <div class="area-cell area-x">${n}x</div>
        <div class="area-cell area-x">${m}x</div>
        <div class="area-cell area-one">${m * n}</div>
      `;
      const lines = [
        `(x + ${m})(x + ${n})`,
        `= x² + ${n}x + ${m}x + ${m * n}`,
        `= x² + ${m + n}x + ${m * n}`
      ];
      result.innerHTML = `<strong>第 ${step + 1} 步</strong><p>${lines[step]}</p><p>四块面积分别是 x²、${n}x、${m}x、${m * n}，相加就是整个矩形面积。</p>`;
    }

    controls.appendChild(makeRange("下边常数 m", 1, 6, 1, m, (value) => {
      m = value;
      draw();
    }));
    controls.appendChild(makeRange("右边常数 n", 1, 6, 1, n, (value) => {
      n = value;
      draw();
    }));
    controls.appendChild(makeButton("下一步", () => {
      step = Math.min(2, step + 1);
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      m = 2;
      n = 3;
      step = 0;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderMultiplicationFormulaAreaLab(model, container) {
    const modes = [
      { label: "(a + b)²", sign: "plus" },
      { label: "(a - b)²", sign: "minus" },
      { label: "(a + b)(a - b)", sign: "difference" }
    ];
    let a = 5;
    let b = 2;
    let modeIndex = 0;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "乘法公式拼图实验台",
      "公式来自面积分割：每一块面积都能在图中找到对应位置。"
    );
    addLabHeading(stage, "当前任务", "切换公式并改变 a、b，观察面积图和公式同步变化。");
    const grid = createEl("div", "formula-area-board");
    stage.appendChild(grid);

    function draw() {
      const mode = modes[modeIndex];
      const plusFormula = `(a + b)² = a² + 2ab + b² = ${a * a} + ${2 * a * b} + ${b * b} = ${(a + b) ** 2}`;
      const minusFormula = `(a - b)² = a² - 2ab + b² = ${a * a} - ${2 * a * b} + ${b * b} = ${(a - b) ** 2}`;
      const diffFormula = `(a + b)(a - b) = a² - b² = ${a * a} - ${b * b} = ${a * a - b * b}`;
      grid.innerHTML = `
        <div class="area-cell area-x2">a²<br>${a * a}</div>
        <div class="area-cell area-x">ab<br>${a * b}</div>
        <div class="area-cell area-x">ab<br>${a * b}</div>
        <div class="area-cell area-one">b²<br>${b * b}</div>
      `;
      const formula = mode.sign === "plus" ? plusFormula : mode.sign === "minus" ? minusFormula : diffFormula;
      result.innerHTML = `<strong>${mode.label}</strong><p>${formula}</p><p>${mode.sign === "difference" ? "平方差可以看成大正方形去掉小正方形。" : "两个 ab 区域说明中间项为什么是 2ab。"}</p>`;
    }

    const switchFormulaButton = makeButton("", () => {
      modeIndex = (modeIndex + 1) % modes.length;
      draw();
    });
    controls.appendChild(switchFormulaButton);
    controls.appendChild(makeRange("a", 3, 9, 1, a, (value) => {
      a = value;
      b = Math.min(b, a - 1);
      draw();
    }));
    controls.appendChild(makeRange("b", 1, 5, 1, b, (value) => {
      b = Math.min(value, a - 1);
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      a = 5;
      b = 2;
      modeIndex = 0;
      draw();
    }));
    const originalDraw = draw;
    draw = function drawWithFormulaButton() {
      switchFormulaButton.textContent = `切换公式：${modes[modeIndex].label}`;
      originalDraw();
    };
    draw();
    container.appendChild(wrap);
  }

  function renderFactorizationPuzzle(model, container) {
    const examples = [
      { type: "十字相乘", b: 5, c: 6, p: 2, q: 3, expression: "x² + 5x + 6" },
      { type: "十字相乘", b: 7, c: 12, p: 3, q: 4, expression: "x² + 7x + 12" },
      { type: "提公因式", expression: "6x + 9", result: "3(2x + 3)" },
      { type: "平方差", expression: "x² - 16", result: "(x + 4)(x - 4)" }
    ];
    let index = 0;
    let pGuess = 2;
    let qGuess = 3;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "因式分解反向拼图",
      "因式分解是整式乘法的逆过程：先观察结构，再反推出乘积形式。"
    );
    const task = addLabHeading(stage, "当前任务", examples[index].expression);
    const board = createEl("div", "factor-board");
    stage.appendChild(board);

    function draw() {
      const example = examples[index];
      task.querySelector("span").textContent = example.expression;
      board.replaceChildren();
      if (example.type === "十字相乘") {
        board.innerHTML = `
          <div class="factor-card">寻找 p、q</div>
          <div class="factor-card">p + q = ${example.b}</div>
          <div class="factor-card">pq = ${example.c}</div>
          <div class="factor-card">${pGuess} + ${qGuess} = ${pGuess + qGuess}</div>
          <div class="factor-card">${pGuess} × ${qGuess} = ${pGuess * qGuess}</div>
        `;
        const ok = pGuess + qGuess === example.b && pGuess * qGuess === example.c;
        result.innerHTML = `<strong>${example.type}</strong><p>${ok ? `匹配成功：${example.expression} = (x + ${pGuess})(x + ${qGuess})。` : "继续调整 p、q，让它们的和等于一次项系数，积等于常数项。"}</p>`;
      } else {
        board.innerHTML = `<div class="factor-card wide">${example.expression}</div><div class="factor-arrow">→</div><div class="factor-card wide">${example.result}</div>`;
        result.innerHTML = `<strong>${example.type}</strong><p>${example.expression} = ${example.result}。观察是否有公因式或平方差结构。</p>`;
      }
    }

    controls.appendChild(makeRange("p", 1, 8, 1, pGuess, (value) => {
      pGuess = value;
      draw();
    }));
    controls.appendChild(makeRange("q", 1, 8, 1, qGuess, (value) => {
      qGuess = value;
      draw();
    }));
    controls.appendChild(makeButton("换一个例子", () => {
      index = (index + 1) % examples.length;
      pGuess = examples[index].p || 2;
      qGuess = examples[index].q || 3;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      index = 0;
      pGuess = 2;
      qGuess = 3;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const next = x % y;
      x = y;
      y = next;
    }
    return x || 1;
  }

  function renderFractionExpressionLab(model, container) {
    let numerator = 6;
    let denominator = 8;
    let otherDenominator = 12;
    let mode = "simplify";
    const { wrap, stage, controls, result } = buildShell(
      model,
      "分式约分通分实验台",
      "分式有意义的前提是分母不为 0；约分和通分都不能改变分式的值。"
    );
    const task = addLabHeading(stage, "当前分式", `${numerator}/${denominator}`);
    const board = createEl("div", "fraction-lab-board");
    stage.appendChild(board);

    function draw() {
      task.querySelector("span").textContent = `${numerator}/${denominator}`;
      const g = gcd(numerator, denominator);
      const lcm = denominator * otherDenominator / gcd(denominator, otherDenominator);
      board.innerHTML = `
        <div class="fraction-card"><span>分子</span><strong>${numerator}</strong></div>
        <div class="fraction-card"><span>分母</span><strong>${denominator}</strong></div>
        <div class="fraction-card"><span>另一个分母</span><strong>${otherDenominator}</strong></div>
      `;
      if (mode === "simplify") {
        result.innerHTML = `<strong>约分</strong><p>公因数是 ${g}，${numerator}/${denominator} = ${numerator / g}/${denominator / g}。</p><p>约去的是分子和分母的共同因数。</p>`;
      } else if (mode === "common") {
        result.innerHTML = `<strong>通分</strong><p>${denominator} 和 ${otherDenominator} 的公分母可以取 ${lcm}。</p><p>通分后分母相同，才方便比较或加减。</p>`;
      } else {
        const a = numerator * (lcm / denominator);
        const b = 1 * (lcm / otherDenominator);
        result.innerHTML = `<strong>分式加减</strong><p>${numerator}/${denominator} + 1/${otherDenominator} = ${a}/${lcm} + ${b}/${lcm} = ${a + b}/${lcm}。</p>`;
      }
    }

    const modes = ["simplify", "common", "add"];
    const modeNames = { simplify: "约分", common: "通分", add: "分式加减" };
    const switchModeButton = makeButton("", () => {
      mode = modes[(modes.indexOf(mode) + 1) % modes.length];
      draw();
    });
    controls.appendChild(switchModeButton);
    controls.appendChild(makeRange("分子", 1, 12, 1, numerator, (value) => {
      numerator = value;
      draw();
    }));
    controls.appendChild(makeRange("分母", 2, 16, 1, denominator, (value) => {
      denominator = value;
      draw();
    }));
    controls.appendChild(makeButton("换另一个分母", () => {
      const options = [6, 8, 10, 12, 15, 16];
      otherDenominator = options[(options.indexOf(otherDenominator) + 1) % options.length] || 12;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      numerator = 6;
      denominator = 8;
      otherDenominator = 12;
      mode = "simplify";
      draw();
    }));
    const originalDraw = draw;
    draw = function drawWithModeButton() {
      switchModeButton.textContent = `切换任务：${modeNames[mode]}`;
      originalDraw();
    };
    draw();
    container.appendChild(wrap);
  }

  function renderRadicalSimplifier(model, container) {
    const examples = [
      { n: 12, factor: 4, outside: 2, inside: 3 },
      { n: 18, factor: 9, outside: 3, inside: 2 },
      { n: 20, factor: 4, outside: 2, inside: 5 },
      { n: 45, factor: 9, outside: 3, inside: 5 }
    ];
    let index = 0;
    let step = 0;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "二次根式化简实验台",
      "把被开方数拆成完全平方数 × 另一个数，就能把完全平方因数提出根号。"
    );
    const task = addLabHeading(stage, "当前根式", `√${examples[index].n}`);
    const svg = createSvg({ viewBox: "0 0 640 180", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function draw() {
      const example = examples[index];
      task.querySelector("span").textContent = `√${example.n}`;
      svg.replaceChildren();
      renderAxis(svg, 0, 8, 88);
      const original = Math.sqrt(example.n);
      const simplified = example.outside * Math.sqrt(example.inside);
      const x1 = axisPosition(original, 0, 8);
      const x2 = axisPosition(simplified, 0, 8);
      svg.appendChild(createSvgEl("circle", { cx: x1, cy: 88, r: 9, class: "custom-point" }));
      svg.appendChild(createSvgEl("circle", { cx: x2, cy: 88, r: 5, class: "custom-point warm" }));
      const steps = [
        `√${example.n}`,
        `= √(${example.factor} × ${example.inside})`,
        `= √${example.factor} × √${example.inside}`,
        `= ${example.outside}√${example.inside}`
      ];
      result.innerHTML = `<strong>第 ${step + 1} 步</strong><p>${steps.slice(0, step + 1).join("<br>")}</p><p>数轴上 √${example.n} 和 ${example.outside}√${example.inside} 的位置相同，说明数值相等。</p>`;
    }

    controls.appendChild(makeButton("选择完全平方因数", () => {
      step = Math.max(step, 1);
      draw();
    }));
    controls.appendChild(makeButton("下一步", () => {
      step = Math.min(3, step + 1);
      draw();
    }));
    controls.appendChild(makeButton("换一个例子", () => {
      index = (index + 1) % examples.length;
      step = 0;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      index = 0;
      step = 0;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderParallelogramShearLab(model, container) {
    let base = 8;
    let height = 5;
    let shear = 2;
    let cutMode = false;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "平行四边形剪拼实验台",
      "平行四边形可以剪下一块移到另一侧，拼成长方形，所以面积 = 底 × 高。"
    );
    addLabHeading(stage, "当前任务", "拖动倾斜程度，观察底和高不变时面积保持不变。");
    const svg = createSvg({ viewBox: "0 0 640 320", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      const sx = 34;
      const w = base * sx;
      const h = height * sx;
      const x = 160;
      const y = 245 - h;
      const offset = shear * 22;
      const points = `${x + offset},${y} ${x + offset + w},${y} ${x + w},${y + h} ${x},${y + h}`;
      svg.appendChild(createSvgEl("polygon", { points, class: "shape-fill" }));
      svg.appendChild(createSvgEl("polygon", { points, class: "shape-outline" }));
      svg.appendChild(createSvgEl("line", { x1: x + offset, y1: y, x2: x + offset, y2: y + h, class: "measure-line dashed" }));
      if (cutMode) {
        svg.appendChild(createSvgEl("rect", { x: x + w + 42, y, width: w, height: h, class: "shape-fill warm-fill" }));
        svg.appendChild(createSvgEl("rect", { x: x + w + 42, y, width: w, height: h, class: "shape-outline" }));
        svg.appendChild(createSvgEl("text", { x: x + w + 52, y: y - 10, class: "custom-svg-label" }, "剪拼成长方形"));
      }
      svg.appendChild(createSvgEl("text", { x, y: 282, class: "custom-svg-label" }, `底=${base}`));
      svg.appendChild(createSvgEl("text", { x: x + offset + 10, y: y + h / 2, class: "custom-svg-label" }, `高=${height}`));
      result.innerHTML = `<strong>实时结果</strong><p>面积 S = 底 × 高 = ${base} × ${height} = ${base * height}。倾斜改变形状，但底和高不变时面积不变。</p><p>对角线互相平分：两条对角线的交点是各自中点。</p>`;
    }

    controls.appendChild(makeRange("底", 4, 10, 1, base, (value) => {
      base = value;
      draw();
    }));
    controls.appendChild(makeRange("高", 3, 8, 1, height, (value) => {
      height = value;
      draw();
    }));
    controls.appendChild(makeButton("改变倾斜", () => {
      shear = (shear + 1) % 5;
      draw();
    }));
    controls.appendChild(makeButton("演示剪拼", () => {
      cutMode = !cutMode;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      base = 8;
      height = 5;
      shear = 2;
      cutMode = false;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderRectangleMeasureLab(model, container) {
    let length = 8;
    let width = 4;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "矩形测量实验台",
      "矩形对边相等，四个角都是直角；对角线相等且互相平分。"
    );
    addLabHeading(stage, "当前任务", "调整长和宽，比较周长、面积和对角线的变化。");
    const svg = createSvg({ viewBox: "0 0 640 320", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      const sx = 34;
      const w = length * sx;
      const h = width * sx;
      const x = 320 - w / 2;
      const y = 160 - h / 2;
      svg.appendChild(createSvgEl("rect", { x, y, width: w, height: h, class: "shape-fill" }));
      svg.appendChild(createSvgEl("rect", { x, y, width: w, height: h, class: "shape-outline" }));
      svg.appendChild(createSvgEl("line", { x1: x, y1: y, x2: x + w, y2: y + h, class: "measure-line" }));
      svg.appendChild(createSvgEl("line", { x1: x + w, y1: y, x2: x, y2: y + h, class: "measure-line dashed" }));
      svg.appendChild(createSvgEl("circle", { cx: x + w / 2, cy: y + h / 2, r: 7, class: "custom-point warm" }));
      svg.appendChild(createSvgEl("text", { x: x + w / 2, y: y - 10, class: "custom-svg-label", "text-anchor": "middle" }, `长=${length}`));
      svg.appendChild(createSvgEl("text", { x: x + w + 8, y: y + h / 2, class: "custom-svg-label" }, `宽=${width}`));
      const area = length * width;
      const perimeter = 2 * (length + width);
      const diagonal = Math.sqrt(length * length + width * width);
      result.innerHTML = `<strong>实时结果</strong><p>周长=${perimeter}，面积=${area}，对角线≈${round(diagonal)}。</p><p>只改变长或宽时，周长线性变化，面积按乘积变化。</p>`;
    }

    controls.appendChild(makeRange("长", 3, 10, 1, length, (value) => {
      length = value;
      draw();
    }));
    controls.appendChild(makeRange("宽", 2, 8, 1, width, (value) => {
      width = value;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      length = 8;
      width = 4;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderRhombusDiagonalLab(model, container) {
    let d1 = 8;
    let d2 = 6;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "菱形对角线实验台",
      "菱形四条边相等，对角线互相垂直且互相平分。"
    );
    addLabHeading(stage, "当前任务", "调整两条对角线，观察面积公式 S = d₁ × d₂ ÷ 2。");
    const svg = createSvg({ viewBox: "0 0 640 320", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      const cx = 320;
      const cy = 160;
      const rx = d1 * 24;
      const ry = d2 * 24;
      const points = `${cx},${cy - ry / 2} ${cx + rx / 2},${cy} ${cx},${cy + ry / 2} ${cx - rx / 2},${cy}`;
      svg.appendChild(createSvgEl("polygon", { points, class: "shape-fill" }));
      svg.appendChild(createSvgEl("polygon", { points, class: "shape-outline" }));
      svg.appendChild(createSvgEl("line", { x1: cx - rx / 2, y1: cy, x2: cx + rx / 2, y2: cy, class: "measure-line" }));
      svg.appendChild(createSvgEl("line", { x1: cx, y1: cy - ry / 2, x2: cx, y2: cy + ry / 2, class: "measure-line dashed" }));
      svg.appendChild(createSvgEl("text", { x: cx, y: cy - ry / 2 - 10, class: "custom-svg-label", "text-anchor": "middle" }, `d₂=${d2}`));
      svg.appendChild(createSvgEl("text", { x: cx + rx / 2 + 8, y: cy, class: "custom-svg-label" }, `d₁=${d1}`));
      const side = Math.sqrt((d1 / 2) ** 2 + (d2 / 2) ** 2);
      result.innerHTML = `<strong>实时结果</strong><p>面积 = ${d1} × ${d2} ÷ 2 = ${round(d1 * d2 / 2)}。四条边都约为 ${round(side)}。</p><p>两条对角线把菱形分成 4 个全等直角三角形。</p>`;
    }

    controls.appendChild(makeRange("对角线 d₁", 4, 12, 1, d1, (value) => {
      d1 = value;
      draw();
    }));
    controls.appendChild(makeRange("对角线 d₂", 4, 12, 1, d2, (value) => {
      d2 = value;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      d1 = 8;
      d2 = 6;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderSquarePropertiesLab(model, container) {
    let side = 5;
    let activeProperty = "矩形性质";
    const properties = ["矩形性质", "菱形性质", "平行四边形性质"];
    const { wrap, stage, controls, result } = buildShell(
      model,
      "正方形性质实验台",
      "正方形既是特殊矩形，也是特殊菱形，还是特殊平行四边形。"
    );
    addLabHeading(stage, "当前任务", "调整边长，并点击性质卡片进行分类。");
    const svg = createSvg({ viewBox: "0 0 640 300", class: "custom-svg lab-svg" });
    const propertyBoard = createEl("div", "property-board");
    stage.append(svg, propertyBoard);

    function draw() {
      svg.replaceChildren();
      propertyBoard.replaceChildren();
      const s = side * 34;
      const x = 320 - s / 2;
      const y = 150 - s / 2;
      svg.appendChild(createSvgEl("rect", { x, y, width: s, height: s, class: "shape-fill" }));
      svg.appendChild(createSvgEl("rect", { x, y, width: s, height: s, class: "shape-outline" }));
      svg.appendChild(createSvgEl("line", { x1: x, y1: y, x2: x + s, y2: y + s, class: "measure-line" }));
      svg.appendChild(createSvgEl("line", { x1: x + s, y1: y, x2: x, y2: y + s, class: "measure-line dashed" }));
      properties.forEach((property) => {
        const card = createEl("button", `property-card${property === activeProperty ? " is-active" : ""}`, property);
        card.type = "button";
        card.addEventListener("click", () => {
          activeProperty = property;
          draw();
        });
        propertyBoard.appendChild(card);
      });
      const diagonal = side * Math.sqrt(2);
      result.innerHTML = `<strong>${activeProperty}</strong><p>边长=${side}，周长=${side * 4}，面积=${side * side}，对角线≈${round(diagonal)}。</p><p>${activeProperty === "矩形性质" ? "四个角都是直角，对角线相等。" : activeProperty === "菱形性质" ? "四条边相等，对角线互相垂直。" : "两组对边分别平行。"}</p>`;
    }

    controls.appendChild(makeRange("边长", 2, 9, 1, side, (value) => {
      side = value;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      side = 5;
      activeProperty = "矩形性质";
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function statistics(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const range = Math.max(...values) - Math.min(...values);
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    const counts = new Map();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    const mode = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return { mean, median, mode, range, variance };
  }

  function renderDataStatisticsLab(model, container) {
    let values = [8, 10, 11, 12, 13, 14, 16];
    const { wrap, stage, controls, result } = buildShell(
      model,
      "数据分析实验台",
      "平均数容易受异常值影响；中位数更关注排序后中间位置。"
    );
    addLabHeading(stage, "当前任务", "修改数据或加入异常值，观察统计量如何变化。");
    const chart = createEl("div", "stat-dot-chart");
    stage.appendChild(chart);

    function draw() {
      chart.replaceChildren();
      const max = Math.max(...values);
      values.forEach((value) => {
        const dot = createEl("span", "stat-dot", String(value));
        dot.style.height = `${Math.max(26, (value / max) * 150)}px`;
        chart.appendChild(dot);
      });
      const s = statistics(values);
      result.innerHTML = `<strong>实时结果</strong><p>数据：${values.join("，")}</p><p>平均数=${round(s.mean)}，中位数=${round(s.median)}，众数=${s.mode}，极差=${s.range}，方差=${round(s.variance)}。</p>`;
    }

    controls.appendChild(makeButton("随机修改一项", () => {
      const index = Math.floor(Math.random() * values.length);
      values[index] = Math.floor(Math.random() * 14) + 5;
      draw();
    }));
    controls.appendChild(makeButton("增加异常值 30", () => {
      if (!values.includes(30)) {
        values.push(30);
      }
      draw();
    }));
    controls.appendChild(makeButton("删除异常值", () => {
      values = values.filter((value) => value !== 30);
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      values = [8, 10, 11, 12, 13, 14, 16];
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderQuadraticRootLab(model, container) {
    const examples = [
      { b: 5, c: 6, roots: [-2, -3], factors: "(x + 2)(x + 3)" },
      { b: -5, c: 6, roots: [2, 3], factors: "(x - 2)(x - 3)" },
      { b: 2, c: 1, roots: [-1, -1], factors: "(x + 1)²" }
    ];
    let index = 0;
    let method = "factor";
    const { wrap, stage, controls, result } = buildShell(
      model,
      "一元二次方程求根实验台",
      "二次方程的根就是让等式左边等于 0 的 x 值，也对应图像与 x 轴的交点。"
    );
    const task = addLabHeading(stage, "当前方程", "");
    const svg = createSvg({ viewBox: "0 0 640 260", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function draw() {
      const ex = examples[index];
      task.querySelector("span").textContent = `x² ${ex.b >= 0 ? "+" : "-"} ${Math.abs(ex.b)}x ${ex.c >= 0 ? "+" : "-"} ${Math.abs(ex.c)} = 0`;
      svg.replaceChildren();
      renderAxis(svg, -6, 6, 132);
      ex.roots.forEach((root) => {
        const x = axisPosition(root, -6, 6);
        svg.appendChild(createSvgEl("circle", { cx: x, cy: 132, r: 9, class: "custom-point warm" }));
        svg.appendChild(createSvgEl("text", { x, y: 92, class: "custom-svg-label", "text-anchor": "middle" }, `x=${root}`));
      });
      const delta = ex.b * ex.b - 4 * ex.c;
      const formulaRoots = `${round((-ex.b + Math.sqrt(delta)) / 2)}，${round((-ex.b - Math.sqrt(delta)) / 2)}`;
      result.innerHTML = method === "factor"
        ? `<strong>因式分解法</strong><p>${ex.factors}=0，所以根是 x=${ex.roots.join(" 和 x=")}。</p><p>若两个因式的乘积为 0，至少有一个因式为 0。</p>`
        : `<strong>公式法</strong><p>Δ=b²-4ac=${delta}，${delta > 0 ? "有两个不相等实根" : delta === 0 ? "有两个相等实根" : "没有实数根"}。</p><p>公式计算根：${formulaRoots}。</p>`;
    }

    const methodButtons = [
      makeButton("因式分解法", () => {
        method = "factor";
        setActiveButton(methodButtons, 0);
        draw();
      }),
      makeButton("公式法", () => {
        method = "formula";
        setActiveButton(methodButtons, 1);
        draw();
      })
    ];
    addButtonGroup(controls, methodButtons);
    controls.appendChild(makeButton("换一个例子", () => {
      index = (index + 1) % examples.length;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      index = 0;
      method = "factor";
      setActiveButton(methodButtons, 0);
      draw();
    }));
    setActiveButton(methodButtons, 0);
    draw();
    container.appendChild(wrap);
  }

  function renderInverseVariationLab(model, container) {
    let k = 6;
    let xValue = 2;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "反比例函数变化实验台",
      "反比例函数 y=k/x 中，x 不能为 0，并且每个点都满足 x × y = k。"
    );
    addLabHeading(stage, "当前任务", "调整 k 和 x，观察 y、乘积关系和图像所在象限。");
    const svg = createSvg({ viewBox: "0 0 640 320", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function sx(value) {
      return 320 + value * 34;
    }

    function sy(value) {
      return 160 - value * 24;
    }

    function pathFor(sign) {
      let path = "";
      for (let x = sign < 0 ? -8 : 0.5; sign < 0 ? x <= -0.5 : x <= 8; x += 0.25) {
        const y = k / x;
        if (Math.abs(y) > 8) continue;
        path += path ? ` L ${sx(x)} ${sy(y)}` : `M ${sx(x)} ${sy(y)}`;
      }
      return path;
    }

    function draw() {
      if (xValue === 0) xValue = 1;
      const y = k / xValue;
      svg.replaceChildren();
      svg.appendChild(createSvgEl("line", { x1: 40, y1: 160, x2: 600, y2: 160, class: "axis-line" }));
      svg.appendChild(createSvgEl("line", { x1: 320, y1: 32, x2: 320, y2: 292, class: "axis-line" }));
      svg.appendChild(createSvgEl("path", { d: pathFor(-1), class: "curve-line" }));
      svg.appendChild(createSvgEl("path", { d: pathFor(1), class: "curve-line" }));
      svg.appendChild(createSvgEl("circle", { cx: sx(xValue), cy: sy(y), r: 9, class: "custom-point warm" }));
      result.innerHTML = `<strong>实时结果</strong><p>y = ${k} / ${xValue} = ${round(y)}，所以 x × y = ${xValue} × ${round(y)} ≈ ${round(xValue * y)}。</p><p>k ${k > 0 ? "大于 0，图像在第一、三象限" : "小于 0，图像在第二、四象限"}；x=0 时分母为 0，函数无意义。</p>`;
    }

    controls.appendChild(makeRange("k", -8, 8, 1, k, (value) => {
      k = value === 0 ? 1 : value;
      draw();
    }));
    controls.appendChild(makeRange("x", -6, 6, 1, xValue, (value) => {
      xValue = value === 0 ? 1 : value;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      k = 6;
      xValue = 2;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderSimilarityScaleLab(model, container) {
    let scale = 1.5;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "相似三角形缩放实验台",
      "相似三角形对应角相等，对应边成比例；周长比等于相似比，面积比等于相似比的平方。"
    );
    addLabHeading(stage, "当前任务", "拖动相似比 k，观察对应边、周长和面积如何变化。");
    const svg = createSvg({ viewBox: "0 0 640 320", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      const small = "80,250 220,250 140,120";
      const x = 330;
      const w = 140 * scale;
      const h = 130 * scale;
      const big = `${x},250 ${x + w},250 ${x + 60 * scale},${250 - h}`;
      svg.appendChild(createSvgEl("polygon", { points: small, class: "shape-fill" }));
      svg.appendChild(createSvgEl("polygon", { points: small, class: "shape-outline" }));
      svg.appendChild(createSvgEl("polygon", { points: big, class: "shape-fill warm-fill" }));
      svg.appendChild(createSvgEl("polygon", { points: big, class: "shape-outline" }));
      svg.appendChild(createSvgEl("text", { x: 86, y: 92, class: "custom-svg-label" }, "△ABC"));
      svg.appendChild(createSvgEl("text", { x, y: 70, class: "custom-svg-label" }, "△A'B'C'"));
      result.innerHTML = `<strong>实时结果</strong><p>相似比 k=${round(scale)}，对应边比例都是 ${round(scale)}。</p><p>周长比=${round(scale)}，面积比=k²=${round(scale * scale)}；对应角保持相等。</p>`;
    }

    controls.appendChild(makeRange("相似比 k", 0.8, 2.4, 0.1, scale, (value) => {
      scale = value;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      scale = 1.5;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderRightTriangleRatioLab(model, container) {
    let angle = 35;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "锐角三角函数实验台",
      "sin、cos、tan 都是直角三角形中边长的比值，角度改变时比值会随之改变。"
    );
    addLabHeading(stage, "当前任务", "拖动锐角 A，观察对边、邻边、斜边和三个比值。");
    const svg = createSvg({ viewBox: "0 0 640 320", class: "custom-svg lab-svg" });
    stage.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      const ax = 130;
      const ay = 250;
      const adjacent = 260;
      const rad = angle * Math.PI / 180;
      const opposite = Math.tan(rad) * adjacent;
      const bx = ax + adjacent;
      const by = ay;
      const cx = bx;
      const cy = ay - opposite;
      const hyp = Math.sqrt(adjacent ** 2 + opposite ** 2);
      svg.appendChild(createSvgEl("polygon", { points: `${ax},${ay} ${bx},${by} ${cx},${cy}`, class: "shape-fill" }));
      svg.appendChild(createSvgEl("polygon", { points: `${ax},${ay} ${bx},${by} ${cx},${cy}`, class: "shape-outline" }));
      svg.appendChild(createSvgEl("text", { x: ax + adjacent / 2, y: ay + 28, class: "custom-svg-label", "text-anchor": "middle" }, "邻边"));
      svg.appendChild(createSvgEl("text", { x: bx + 10, y: (by + cy) / 2, class: "custom-svg-label" }, "对边"));
      svg.appendChild(createSvgEl("text", { x: (ax + cx) / 2 - 20, y: (ay + cy) / 2 - 12, class: "custom-svg-label" }, "斜边"));
      svg.appendChild(createSvgEl("text", { x: ax + 38, y: ay - 16, class: "custom-svg-label" }, `A=${angle}°`));
      result.innerHTML = `<strong>实时结果</strong><p>对边≈${round(opposite / 40)}，邻边≈${round(adjacent / 40)}，斜边≈${round(hyp / 40)}。</p><p>sinA≈${round(Math.sin(rad))}，cosA≈${round(Math.cos(rad))}，tanA≈${round(Math.tan(rad))}。</p>`;
    }

    controls.appendChild(makeRange("锐角 A", 15, 70, 1, angle, (value) => {
      angle = value;
      draw();
    }));
    controls.appendChild(makeButton("重置", () => {
      angle = 35;
      draw();
    }));
    draw();
    container.appendChild(wrap);
  }

  function renderThreeViewLab(model, container) {
    const views = {
      front: { label: "主视图", shape: "长方形：看长和高" },
      left: { label: "左视图", shape: "窄长方形：看宽和高" },
      top: { label: "俯视图", shape: "长方形：看长和宽" }
    };
    let view = "front";
    const { wrap, stage, controls, result } = buildShell(
      model,
      "三视图观察实验台",
      "从不同方向观察同一个立体图形，会得到不同的二维投影。"
    );
    addLabHeading(stage, "当前任务", "点击观察方向，匹配主视图、左视图和俯视图。");
    const scene = createEl("div", "three-view-scene");
    const projection = createEl("div", "projection-card");
    stage.append(scene, projection);

    function draw() {
      scene.innerHTML = `
        <div class="cube-face front-face"></div>
        <div class="cube-face side-face"></div>
        <div class="cube-face top-face"></div>
      `;
      projection.textContent = views[view].label;
      projection.className = `projection-card view-${view}`;
      result.innerHTML = `<strong>${views[view].label}</strong><p>${views[view].shape}。</p><p>练习：先想象眼睛站在哪个方向，再把看到的面画成平面图。</p>`;
    }

    const viewKeys = Object.keys(views);
    const switchViewButton = makeButton("", () => {
      const currentIndex = viewKeys.indexOf(view);
      view = viewKeys[(currentIndex + 1) % viewKeys.length];
      draw();
    });
    controls.appendChild(switchViewButton);
    controls.appendChild(makeButton("选择正确视图", () => {
      result.innerHTML += "<p>如果从正前方看，只能看到物体的长和高，这就是主视图。</p>";
    }));
    controls.appendChild(makeButton("重置", () => {
      view = "front";
      draw();
    }));
    const originalDraw = draw;
    draw = function drawWithViewButton() {
      switchViewButton.textContent = `切换视图：${views[view].label}`;
      originalDraw();
    };
    draw();
    container.appendChild(wrap);
  }

  function renderProbabilitySimulatorLab(model, container) {
    const modes = ["摸球实验", "转盘实验", "抛硬币实验"];
    let modeIndex = 0;
    let red = 4;
    let blue = 6;
    let trials = 0;
    let success = 0;
    const { wrap, stage, controls, result } = buildShell(
      model,
      "概率模拟实验台",
      "实验次数越多，实验频率通常越接近理论概率，但每次实验结果仍有随机性。"
    );
    addLabHeading(stage, "当前任务", "选择实验类型，比较理论概率和实验频率。");
    const board = createEl("div", "probability-board");
    stage.appendChild(board);

    function theoreticalProbability() {
      if (modeIndex === 0) return red / (red + blue);
      if (modeIndex === 1) return red / (red + blue);
      return 0.5;
    }

    function simulate(times) {
      const p = theoreticalProbability();
      for (let i = 0; i < times; i += 1) {
        trials += 1;
        if (Math.random() < p) {
          success += 1;
        }
      }
      draw();
    }

    function draw() {
      const p = theoreticalProbability();
      const frequency = trials ? success / trials : 0;
      board.replaceChildren();
      if (modeIndex === 0) {
        for (let i = 0; i < red; i += 1) board.appendChild(createEl("span", "ball red-ball"));
        for (let i = 0; i < blue; i += 1) board.appendChild(createEl("span", "ball blue-ball"));
      } else if (modeIndex === 1) {
        const wheel = createEl("div", "probability-wheel");
        wheel.style.background = `conic-gradient(#e85d75 0deg ${p * 360}deg, #2e86de ${p * 360}deg 360deg)`;
        board.appendChild(wheel);
      } else {
        board.append(createEl("div", "coin-card", "正面"), createEl("div", "coin-card", "反面"));
      }
      const bar = createEl("div", "frequency-bar");
      bar.innerHTML = `<span style="width:${Math.min(100, frequency * 100)}%"></span>`;
      board.appendChild(bar);
      result.innerHTML = `<strong>${modes[modeIndex]}</strong><p>理论概率≈${round(p)}；实验 ${trials} 次，目标结果 ${success} 次，实验频率≈${round(frequency)}。</p>`;
    }

    const switchModeButton = makeButton("", () => {
      modeIndex = (modeIndex + 1) % modes.length;
      trials = 0;
      success = 0;
      draw();
    });
    controls.appendChild(switchModeButton);
    controls.appendChild(makeRange("红球 / 红色区域", 1, 10, 1, red, (value) => {
      red = value;
      trials = 0;
      success = 0;
      draw();
    }));
    controls.appendChild(makeRange("蓝球 / 蓝色区域", 1, 10, 1, blue, (value) => {
      blue = value;
      trials = 0;
      success = 0;
      draw();
    }));
    addButtonGroup(controls, [
      makeButton("模拟 1 次", () => simulate(1)),
      makeButton("模拟 100 次", () => simulate(100)),
      makeButton("重置", () => {
        trials = 0;
        success = 0;
        draw();
      })
    ]);
    const originalDraw = draw;
    draw = function drawWithModeButton() {
      switchModeButton.textContent = `切换实验：${modes[modeIndex]}`;
      originalDraw();
    };
    draw();
    container.appendChild(wrap);
  }

  const renderers = {
    "rational-number-lab": renderRationalNumberLab,
    "geometry-basics-builder": renderGeometryBasicsBuilder,
    "real-number-classifier": renderRealNumberClassifier,
    "system-elimination-lab": renderSystemEliminationLab,
    "inequality-number-line": renderInequalityNumberLineLab,
    "survey-chart-lab": renderSurveyChartLab,
    "congruence-test-lab": renderCongruenceTestLab,
    "symmetry-mirror-lab": renderSymmetryMirrorLab,
    "isosceles-triangle-lab": renderIsoscelesTriangleLab,
    "polynomial-area-multiply": renderPolynomialAreaMultiply,
    "multiplication-formula-area": renderMultiplicationFormulaAreaLab,
    "factorization-puzzle": renderFactorizationPuzzle,
    "fraction-expression-lab": renderFractionExpressionLab,
    "radical-simplifier": renderRadicalSimplifier,
    "parallelogram-shear-lab": renderParallelogramShearLab,
    "rectangle-measure-lab": renderRectangleMeasureLab,
    "rhombus-diagonal-lab": renderRhombusDiagonalLab,
    "square-properties-lab": renderSquarePropertiesLab,
    "data-statistics-lab": renderDataStatisticsLab,
    "quadratic-root-lab": renderQuadraticRootLab,
    "inverse-variation-lab": renderInverseVariationLab,
    "similarity-scale-lab": renderSimilarityScaleLab,
    "right-triangle-ratio-lab": renderRightTriangleRatioLab,
    "three-view-lab": renderThreeViewLab,
    "probability-simulator-lab": renderProbabilitySimulatorLab,
    "number-line": renderNumberLine,
    "equation-balance": renderEquationBalance,
    "equation-step-balance": renderEquationStepBalance,
    "like-term-sorter": renderLikeTermSorter,
    "algebra-tiles": renderAlgebraTiles,
    "area-multiplication": renderAreaMultiplication,
    "square-formula-area": renderSquareFormulaArea,
    "reverse-area-factorization": renderReverseAreaFactorization,
    "fraction-bars": renderFractionBars,
    "angle-lines": renderAngleLines,
    "symmetry-mirror": renderSymmetryMirror,
    "shape-area": renderShapeArea,
    "data-chart": renderDataChart,
    "probability-simulator": renderProbabilitySimulator,
    "function-mini-graph": renderFunctionMiniGraph,
    "triangle-ratio": renderTriangleRatio,
    "view-3d": renderView3d
  };

  function renderCustomInteractive(model, container) {
    const template = model?.interactive?.template;
    const renderer = renderers[template];
    container.replaceChildren();

    if (!renderer) {
      const empty = createEl("div", "interactive-placeholder");
      empty.append(createEl("strong", "", "互动内容准备中"), createEl("span", "", "这个知识点的轻量互动组件正在补充。"));
      container.appendChild(empty);
      return;
    }

    renderer(model, container);
  }

  window.CustomInteractives = {
    renderCustomInteractive
  };
})();
