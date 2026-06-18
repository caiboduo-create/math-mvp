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
      "先按同类项归类，再分别合并；x² 项、x 项和常数项不能混在一起合并。"
    );

    stage.classList.add("like-term-stage");
    const expressionBox = createEl("div", "expression-focus");
    const legend = createEl("div", "like-term-legend");
    const groupBoard = createEl("div", "like-term-groups");
    stage.append(expressionBox, legend, groupBoard);

    const stepButtons = [
      makeButton("第一步：识别同类项", () => {
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

    function termCard(term) {
      const className = term.variable
        ? `like-term-card variable-term${term.power === 2 ? " square-term" : ""}${term.coef < 0 ? " negative" : ""}`
        : `like-term-card constant-term${term.coef < 0 ? " negative" : ""}`;
      const label = !term.variable && term.coef > 0 ? `+${term.coef}` : formatTerm(term, true);
      return createEl("span", className, label);
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

      expressionBox.innerHTML = `<strong>原式：</strong><span>${original}</span>`;
      legend.replaceChildren(
        createEl("span", "legend-chip variable-term", "蓝色表示含字母的同类项"),
        createEl("span", "legend-chip constant-term", "橙色表示常数项"),
        createEl("span", "legend-note", "只有同类项之间才能合并")
      );

      groupBoard.replaceChildren();
      groups.forEach((group) => {
        const groupEl = createEl("div", "like-term-group");
        groupEl.appendChild(createEl("h4", "", group.label));
        const cards = createEl("div", "like-term-card-row");
        group.terms.forEach((term) => cards.appendChild(termCard(term)));
        groupEl.appendChild(cards);
        groupBoard.appendChild(groupEl);
      });

      stepButtons.forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === step - 1);
      });

      result.replaceChildren();
      const title = createEl("strong", "", step === 0 ? "操作提示" : `第 ${step} 步`);
      const body = createEl("div", "step-explanation");
      if (step === 0) {
        body.appendChild(createEl("p", "", "点击步骤按钮，观察从识别同类项到得到结果的完整过程。"));
      } else if (step === 1) {
        body.appendChild(createEl("p", "", `把同类项放在一起：${grouped}`));
        explanationFor(terms, groups).forEach((text) => body.appendChild(createEl("p", "", text)));
      } else if (step === 2) {
        body.appendChild(createEl("p", "", `分别计算：${combined}`));
        body.appendChild(createEl("p", "", "合并同类项时，只把系数相加，字母和字母指数保持不变。"));
      } else {
        body.appendChild(createEl("p", "", `最终结果：${original} = ${combined}`));
        body.appendChild(createEl("p", "", "先归类，再合并；不同类的项保留下来，不能硬凑在一起。"));
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

    const constantButton = makeButton("", () => {
      if (step === 0) {
        step = 1;
        errorMessage = "";
        draw();
      }
    });
    const divideButton = makeButton("", () => {
      if (step < 1) {
        errorMessage = "请先消去常数项。等式两边必须进行相同操作，不能只处理一边。";
        balance.classList.add("is-tilted");
        draw();
        window.setTimeout(() => balance.classList.remove("is-tilted"), 700);
        return;
      }
      step = 2;
      errorMessage = "";
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
    controls.append(constantButton, divideButton, backButton, resetButton, changeButton);

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
      constantButton.textContent = eq.b > 0 ? `两边同时减 ${eq.b}` : `两边同时加 ${Math.abs(eq.b)}`;
      divideButton.textContent = `两边同时除以 ${eq.a}`;
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

  const renderers = {
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
