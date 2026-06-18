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
    "algebra-tiles": renderAlgebraTiles,
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
