(function () {
  const round = (value, digits = 2) => Number(value).toFixed(digits).replace(/\.?0+$/, "");
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const choice = (items) => items[randomInt(0, items.length - 1)];
  const pi = Math.PI;

  const models = [
    {
      id: "rational-number",
      title: "有理数",
      grade: "七年级",
      domain: "数与代数",
      icon: "N",
      description: "学习正数、负数、数轴、相反数、绝对值以及有理数加减乘除乘方。",
      tags: ["正负数", "数轴", "绝对值", "有理数运算"],
      difficulty: "基础",
      formula: ["同号相加取相同符号，并把绝对值相加。", "异号相加取绝对值较大数的符号，并用较大绝对值减较小绝对值。"],
      examples: ["计算：-8 + 13 - 5", "比较：-3 与 2 的大小"]
    },
    {
      id: "polynomial-add-sub",
      title: "整式加减",
      grade: "七年级",
      domain: "数与代数",
      icon: "A",
      description: "学习单项式、多项式、同类项、合并同类项和整式加减。",
      tags: ["单项式", "多项式", "同类项", "合并同类项"],
      difficulty: "基础",
      formula: ["同类项：所含字母相同，并且相同字母的指数也相同。", "合并同类项：系数相加，字母和字母指数不变。"],
      examples: ["化简：3x + 5x - 2x", "化简：2a + 3b - a + b"]
    },
    {
      id: "linear-equation-one",
      title: "一元一次方程",
      grade: "七年级",
      domain: "数与代数",
      icon: "X",
      description: "学习一元一次方程的解法，并用方程解决实际问题。",
      tags: ["方程", "移项", "去括号", "去分母"],
      difficulty: "基础",
      formula: ["一元一次方程的一般形式：ax + b = 0，其中 a ≠ 0。", "解题核心：去分母、去括号、移项、合并同类项、系数化为 1。"],
      examples: ["解方程：3x + 5 = 20", "解方程：2(x + 3) = 18"]
    },
    {
      id: "basic-geometry",
      title: "几何图形初步",
      grade: "七年级",
      domain: "图形与几何",
      icon: "G",
      description: "认识点、线、面、体，学习直线、射线、线段和角。",
      tags: ["点线面", "线段", "射线", "角"],
      difficulty: "基础",
      formula: ["线段有两个端点，可以度量长度。", "射线有一个端点，向一方无限延伸。", "直线没有端点，向两方无限延伸。"],
      examples: ["判断：线段 AB 有几个端点？", "判断：角的两边是什么图形？"]
    },
    {
      id: "parallel-lines",
      title: "相交线与平行线",
      grade: "七年级",
      domain: "图形与几何",
      icon: "∥",
      description: "学习对顶角、邻补角、垂线、平行线判定和平行线性质。",
      tags: ["对顶角", "垂线", "平行线", "同位角", "内错角"],
      difficulty: "基础",
      geoGebra: {
        enabled: true,
        embedType: "applet",
        appName: "geometry",
        materialId: "",
        height: 420,
        construction: "parallel-lines",
        description: "拖动截线上的点，观察同位角、内错角和同旁内角的变化。"
      },
      formula: ["对顶角相等。", "两直线平行，同位角相等，内错角相等，同旁内角互补。"],
      examples: ["已知两直线平行，同位角为 65°，求另一个同位角。", "邻补角一个为 110°，求另一个角。"]
    },
    {
      id: "real-number",
      title: "实数",
      grade: "七年级",
      domain: "数与代数",
      icon: "R",
      description: "学习平方根、算术平方根、立方根、无理数和实数。",
      tags: ["平方根", "立方根", "无理数", "实数"],
      difficulty: "基础",
      formula: ["如果 x² = a，那么 x 叫做 a 的平方根。", "非负数 a 的非负平方根叫做算术平方根。"],
      examples: ["求 49 的算术平方根。", "判断：√2 是有理数还是无理数？"]
    },
    {
      id: "coordinate-system",
      title: "平面直角坐标系",
      grade: "七年级",
      domain: "函数",
      icon: "P",
      description: "学习坐标轴、象限、点的坐标以及坐标表示位置。",
      tags: ["坐标", "象限", "点的位置"],
      difficulty: "基础",
      geoGebra: {
        enabled: true,
        embedType: "applet",
        appName: "graphing",
        materialId: "",
        height: 420,
        construction: "coordinate-system",
        description: "拖动坐标系中的点，实时观察横坐标和纵坐标。"
      },
      formula: ["点 P(x, y) 中，x 表示横坐标，y 表示纵坐标。", "第一象限：x > 0，y > 0。"],
      examples: ["判断点 (3, -2) 在第几象限。", "写出点 A 的横坐标和纵坐标。"]
    },
    {
      id: "linear-equations-two",
      title: "二元一次方程组",
      grade: "七年级",
      domain: "数与代数",
      icon: "E",
      description: "学习二元一次方程组，用代入消元法和加减消元法解题。",
      tags: ["二元一次方程组", "代入消元", "加减消元"],
      difficulty: "进阶",
      formula: ["解二元一次方程组的核心方法是消元。", "常用方法：代入消元法、加减消元法。"],
      examples: ["解方程组：x + y = 12，x - y = 4", "解方程组：2x + y = 9，x + y = 6"]
    },
    {
      id: "inequality",
      title: "不等式与不等式组",
      grade: "七年级",
      domain: "数与代数",
      icon: ">",
      description: "学习不等式性质、一元一次不等式和不等式组。",
      tags: ["不等式", "解集", "数轴", "不等式组"],
      difficulty: "进阶",
      formula: ["不等式两边同乘或同除以负数，不等号方向要改变。", "不等式组的解集是各个不等式解集的公共部分。"],
      examples: ["解不等式：2x + 3 > 11", "解不等式：-3x < 12"]
    },
    {
      id: "data-collection",
      title: "数据收集整理",
      grade: "七年级",
      domain: "统计与概率",
      icon: "D",
      description: "学习调查、统计表、条形图、扇形图和数据整理。",
      tags: ["调查", "统计表", "条形图", "扇形图"],
      difficulty: "基础",
      formula: ["频数表示某类数据出现的次数。", "百分比 = 某类数量 ÷ 总数量 × 100%。"],
      examples: ["全班 40 人，喜欢篮球 10 人，求所占百分比。", "根据统计表找出人数最多的项目。"]
    },
    {
      id: "triangle",
      title: "三角形",
      grade: "八年级",
      domain: "图形与几何",
      icon: "△",
      description: "学习三角形的边、角、高、中线、角平分线、面积和内角和。",
      tags: ["边", "高", "面积", "内角和"],
      difficulty: "基础",
      geoGebra: {
        enabled: true,
        embedType: "applet",
        appName: "geometry",
        materialId: "",
        height: 420,
        construction: "triangle",
        description: "拖动三角形顶点，观察底、高、面积和形状变化。"
      },
      formula: ["三角形面积：S = 底 × 高 ÷ 2。", "三角形内角和等于 180°。"],
      examples: ["一个三角形底为 12 厘米，高为 5 厘米，求面积。"],
      visual: "triangle",
      params: [
        { key: "base", label: "底 b", min: 4, max: 12, step: 0.1, value: 8, unit: "" },
        { key: "height", label: "高 h", min: 3, max: 10, step: 0.1, value: 6, unit: "" },
        { key: "shift", label: "顶点偏移", min: -3, max: 3, step: 0.1, value: 0, unit: "" }
      ],
      metrics: (p) => ({
        "面积 S": round((p.base * p.height) / 2),
        "底高关系": "S = 1/2 × b × h",
        "顶点偏移": round(p.shift)
      })
    },
    {
      id: "congruent-triangle",
      title: "全等三角形",
      grade: "八年级",
      domain: "图形与几何",
      icon: "≅",
      description: "学习全等三角形的性质和判定方法。",
      tags: ["SSS", "SAS", "ASA", "AAS", "HL"],
      difficulty: "进阶",
      formula: ["全等三角形对应边相等，对应角相等。", "常用判定：SSS、SAS、ASA、AAS、HL。"],
      examples: ["已知两三角形满足 SSS，判断是否全等。"]
    },
    {
      id: "symmetry",
      title: "轴对称",
      grade: "八年级",
      domain: "图形与几何",
      icon: "M",
      description: "学习轴对称图形、对称轴、线段垂直平分线和最短路径。",
      tags: ["轴对称", "对称轴", "垂直平分线"],
      difficulty: "基础",
      formula: ["轴对称点到对称轴的距离相等。", "线段垂直平分线上的点到线段两端距离相等。"],
      examples: ["点 A 到对称轴距离 4 厘米，对称点 A' 到对称轴距离是多少？"]
    },
    {
      id: "isosceles-triangle",
      title: "等腰三角形",
      grade: "八年级",
      domain: "图形与几何",
      icon: "I",
      description: "学习等腰三角形性质、判定和等边三角形。",
      tags: ["等腰三角形", "等边三角形", "底角"],
      difficulty: "基础",
      formula: ["等腰三角形两底角相等。", "等边三角形三个角都等于 60°。"],
      examples: ["等腰三角形顶角为 40°，求每个底角。"]
    },
    {
      id: "polynomial-multiply",
      title: "整式乘法",
      grade: "八年级",
      domain: "数与代数",
      icon: "×",
      description: "学习幂的运算、单项式乘法、多项式乘法。",
      tags: ["幂", "单项式", "多项式", "乘法"],
      difficulty: "进阶",
      formula: ["同底数幂相乘：aᵐ × aⁿ = aᵐ⁺ⁿ。", "单项式乘单项式：系数相乘，同底数幂指数相加。"],
      examples: ["计算：x³ × x⁵", "计算：3x² × 4x³"]
    },
    {
      id: "multiplication-formula",
      title: "乘法公式",
      grade: "八年级",
      domain: "数与代数",
      icon: "F",
      description: "学习平方差公式和完全平方公式。",
      tags: ["平方差", "完全平方", "公式"],
      difficulty: "进阶",
      formula: ["平方差公式：(a + b)(a - b) = a² - b²。", "完全平方公式：(a ± b)² = a² ± 2ab + b²。"],
      examples: ["计算：(x + 5)(x - 5)", "展开：(x + 3)²"]
    },
    {
      id: "factorization",
      title: "因式分解",
      grade: "八年级",
      domain: "数与代数",
      icon: "∏",
      description: "学习提公因式法、公式法和因式分解。",
      tags: ["公因式", "平方差", "完全平方", "分解"],
      difficulty: "进阶",
      formula: ["因式分解是把多项式化成几个整式乘积的形式。", "常用方法：提公因式法、公式法。"],
      examples: ["分解因式：6x + 9", "分解因式：x² - 16"]
    },
    {
      id: "fraction-expression",
      title: "分式",
      grade: "八年级",
      domain: "数与代数",
      icon: "/",
      description: "学习分式的概念、性质、运算和分式方程。",
      tags: ["分式", "约分", "通分", "分式方程"],
      difficulty: "进阶",
      formula: ["分式有意义的条件：分母不等于 0。", "分式基本性质：分子分母同乘或同除以同一个不为 0 的整式，分式值不变。"],
      examples: ["若分式 1/(x-3) 有意义，求 x 的限制。"]
    },
    {
      id: "quadratic-radical",
      title: "二次根式",
      grade: "八年级",
      domain: "数与代数",
      icon: "√",
      description: "学习二次根式的概念、性质、化简和运算。",
      tags: ["二次根式", "化简", "最简二次根式"],
      difficulty: "进阶",
      formula: ["√a 有意义的条件：a ≥ 0。", "√(ab) = √a × √b，其中 a ≥ 0，b ≥ 0。"],
      examples: ["化简：√48", "判断：√(x-2) 有意义时 x 的范围。"]
    },
    {
      id: "pythagorean-theorem",
      title: "勾股定理",
      grade: "八年级",
      domain: "图形与几何",
      icon: "P",
      description: "学习直角三角形三边关系，以及勾股定理的逆定理。",
      tags: ["直角三角形", "勾股定理", "斜边"],
      difficulty: "进阶",
      geoGebra: {
        enabled: true,
        embedType: "applet",
        appName: "geometry",
        materialId: "",
        height: 420,
        construction: "pythagorean-theorem",
        description: "拖动直角三角形的边长，观察 a² + b² = c² 的关系。"
      },
      formula: ["直角三角形两直角边为 a、b，斜边为 c，则 a² + b² = c²。"],
      examples: ["直角三角形两条直角边分别是 6 和 8，求斜边。"]
    },
    {
      id: "parallelogram",
      title: "平行四边形",
      grade: "八年级",
      domain: "图形与几何",
      icon: "▱",
      description: "学习平行四边形的性质和判定。",
      tags: ["对边平行", "对角相等", "对角线"],
      difficulty: "基础",
      formula: ["平行四边形对边平行且相等，对角相等。", "面积：S = 底 × 高。"],
      examples: ["平行四边形底为 9，高为 4，求面积。"]
    },
    {
      id: "rectangle",
      title: "矩形",
      grade: "八年级",
      domain: "图形与几何",
      icon: "▭",
      description: "学习矩形的性质、判定、面积和对角线。",
      tags: ["直角", "对角线", "面积"],
      difficulty: "基础",
      formula: ["矩形四个角都是直角，对角线相等且互相平分。", "面积：S = 长 × 宽。"],
      examples: ["矩形长 8，宽 5，求面积。"]
    },
    {
      id: "rhombus",
      title: "菱形",
      grade: "八年级",
      domain: "图形与几何",
      icon: "◇",
      description: "学习菱形的性质、判定、面积和对角线。",
      tags: ["四边相等", "对角线", "面积"],
      difficulty: "进阶",
      formula: ["菱形四边相等，对角线互相垂直平分。", "面积：S = 两条对角线乘积 ÷ 2。"],
      examples: ["菱形两条对角线分别为 10 和 6，求面积。"]
    },
    {
      id: "square",
      title: "正方形",
      grade: "八年级",
      domain: "图形与几何",
      icon: "□",
      description: "学习正方形的性质、面积、周长和对角线。",
      tags: ["边长", "面积", "周长", "对角线"],
      difficulty: "基础",
      formula: ["正方形面积：S = a²。", "正方形周长：C = 4a。"],
      examples: ["正方形边长为 7，求面积和周长。"]
    },
    {
      id: "linear-function",
      title: "一次函数",
      grade: "八年级",
      domain: "函数",
      icon: "L",
      description: "学习一次函数 y=kx+b 的图象、性质和实际应用。",
      tags: ["k", "b", "斜率", "截距", "图象"],
      difficulty: "进阶",
      geoGebra: {
        enabled: true,
        embedType: "applet",
        appName: "graphing",
        materialId: "",
        height: 420,
        construction: "linear-function",
        description: "拖动 k、b 滑块，观察一次函数图像的斜率和截距变化。"
      },
      formula: ["一次函数：y = kx + b，其中 k ≠ 0。", "k 决定图象倾斜方向和变化快慢，b 是 y 轴截距。"],
      examples: ["已知一次函数 y = 2x + 3，求 x=5 时 y 的值。"]
    },
    {
      id: "data-analysis",
      title: "数据分析",
      grade: "八年级",
      domain: "统计与概率",
      icon: "S",
      description: "学习平均数、中位数、众数、方差和数据波动。",
      tags: ["平均数", "中位数", "众数", "方差"],
      difficulty: "基础",
      formula: ["平均数 = 数据总和 ÷ 数据个数。", "方差反映数据波动大小。"],
      examples: ["求 6、8、10 的平均数。", "找出 2、3、3、5 的众数。"]
    },
    {
      id: "quadratic-equation",
      title: "一元二次方程",
      grade: "九年级",
      domain: "数与代数",
      icon: "Q",
      description: "学习一元二次方程的解法、判别式和实际应用。",
      tags: ["配方法", "公式法", "因式分解", "判别式"],
      difficulty: "进阶",
      formula: ["一元二次方程：ax² + bx + c = 0，其中 a ≠ 0。", "判别式：Δ = b² - 4ac。"],
      examples: ["解方程：x² - 5x + 6 = 0", "判断方程 x² + 2x + 5 = 0 的根的情况。"]
    },
    {
      id: "quadratic-function",
      title: "二次函数 / 抛物线",
      grade: "九年级",
      domain: "函数",
      icon: "U",
      description: "学习二次函数 y=ax²+bx+c 的图象、顶点、开口方向和最值。",
      tags: ["抛物线", "顶点", "对称轴", "开口", "最值"],
      difficulty: "进阶",
      geoGebra: {
        enabled: true,
        embedType: "applet",
        appName: "graphing",
        materialId: "",
        height: 440,
        construction: "quadratic-function",
        description: "拖动 a、b、c 滑块，观察抛物线开口、顶点和对称轴变化。"
      },
      formula: ["二次函数：y = ax² + bx + c，其中 a ≠ 0。", "对称轴：x = -b / 2a。", "顶点坐标：(-b / 2a, (4ac-b²) / 4a)。"],
      examples: ["已知 y = x² - 4x + 3，求对称轴。"],
      visual: "parabola",
      params: [
        { key: "a", label: "系数 a", min: -2, max: 2, step: 0.1, value: 0.8, unit: "" },
        { key: "h", label: "顶点横坐标 h", min: -4, max: 4, step: 0.1, value: 0, unit: "" },
        { key: "k", label: "顶点纵坐标 k", min: -5, max: 5, step: 0.1, value: 0, unit: "" }
      ],
      metrics: (p) => ({
        "函数": `y = ${round(p.a)}(x - ${round(p.h)})² + ${round(p.k)}`,
        "顶点": `(${round(p.h)}, ${round(p.k)})`,
        "开口": p.a >= 0 ? "向上" : "向下"
      })
    },
    {
      id: "inverse-function",
      title: "反比例函数",
      grade: "九年级",
      domain: "函数",
      icon: "H",
      description: "学习反比例函数 y=k/x 的图象、性质和实际问题。",
      tags: ["反比例", "双曲线", "k", "象限"],
      difficulty: "进阶",
      formula: ["反比例函数：y = k/x，其中 k ≠ 0。", "当 k > 0 时，图象在第一、三象限；当 k < 0 时，图象在第二、四象限。"],
      examples: ["已知 y = 12/x，求 x=3 时 y 的值。"]
    },
    {
      id: "circle",
      title: "圆",
      grade: "九年级",
      domain: "图形与几何",
      icon: "○",
      description: "学习圆的半径、直径、周长、面积、弦、弧和圆心角。",
      tags: ["半径", "直径", "面积", "周长"],
      difficulty: "基础",
      geoGebra: {
        enabled: true,
        embedType: "applet",
        appName: "geometry",
        materialId: "",
        height: 420,
        construction: "circle",
        description: "拖动半径滑块，观察圆的半径、周长和面积变化。"
      },
      formula: ["圆面积：S = πr²。", "圆周长：C = 2πr。", "直径：d = 2r。"],
      examples: ["半径为 5 厘米，求圆的面积或周长。"],
      visual: "circle",
      params: [
        { key: "radius", label: "半径 r", min: 2, max: 10, step: 0.1, value: 5, unit: "" }
      ],
      metrics: (p) => ({
        "面积 S": `约 ${round(pi * p.radius * p.radius)}`,
        "周长 C": `约 ${round(2 * pi * p.radius)}`,
        "核心公式": "S = πr²，C = 2πr"
      })
    },
    {
      id: "sector",
      title: "扇形",
      grade: "九年级",
      domain: "图形与几何",
      icon: "◔",
      description: "学习扇形面积、弧长、圆心角和半径之间的关系。",
      tags: ["半径", "圆心角", "弧长", "面积"],
      difficulty: "进阶",
      geoGebra: {
        enabled: true,
        embedType: "applet",
        appName: "geometry",
        materialId: "",
        height: 420,
        construction: "sector",
        description: "拖动半径和圆心角滑块，观察扇形弧长与面积变化。"
      },
      formula: ["扇形面积：S = θ/360° × πr²。", "弧长：L = θ/360° × 2πr。"],
      examples: ["半径为 6 厘米，圆心角为 60°，求扇形面积。"],
      visual: "sector",
      params: [
        { key: "radius", label: "半径 r", min: 2, max: 10, step: 0.1, value: 6, unit: "" },
        { key: "angle", label: "圆心角 θ", min: 30, max: 330, step: 1, value: 120, unit: "°" }
      ],
      metrics: (p) => ({
        "面积 S": round((p.angle / 360) * pi * p.radius * p.radius),
        "弧长 L": round((p.angle / 360) * 2 * pi * p.radius),
        "核心公式": "S = θ/360° × πr²，L = θ/360° × 2πr"
      })
    },
    {
      id: "similar-triangle",
      title: "相似三角形",
      grade: "九年级",
      domain: "图形与几何",
      icon: "∽",
      description: "学习相似图形、相似三角形判定、性质和比例线段。",
      tags: ["相似", "比例", "对应边", "对应角"],
      difficulty: "进阶",
      formula: ["相似三角形对应角相等，对应边成比例。", "面积比等于相似比的平方。"],
      examples: ["两个相似三角形的相似比为 2:3，小三角形一边为 8，求对应大三角形边长。"]
    },
    {
      id: "trigonometry",
      title: "锐角三角函数",
      grade: "九年级",
      domain: "图形与几何",
      icon: "T",
      description: "学习正弦、余弦、正切，并用三角函数解决直角三角形问题。",
      tags: ["sin", "cos", "tan", "直角三角形"],
      difficulty: "进阶",
      formula: ["sinA = 对边 / 斜边。", "cosA = 邻边 / 斜边。", "tanA = 对边 / 邻边。"],
      examples: ["直角三角形中，对边为 3，斜边为 5，求 sinA。"]
    },
    {
      id: "projection-view",
      title: "投影与三视图",
      grade: "九年级",
      domain: "图形与几何",
      icon: "V",
      description: "学习投影、主视图、左视图、俯视图和立体图形识别。",
      tags: ["投影", "主视图", "左视图", "俯视图"],
      difficulty: "基础",
      formula: ["主视图从正面看，左视图从左面看，俯视图从上面看。"],
      examples: ["一个长方体长 6、宽 4、高 3，主视图是什么形状？"]
    },
    {
      id: "probability",
      title: "概率初步",
      grade: "九年级",
      domain: "统计与概率",
      icon: "%",
      description: "学习随机事件、概率、列表法和树状图法。",
      tags: ["随机事件", "概率", "列表法", "树状图"],
      difficulty: "基础",
      formula: ["概率 = 目标结果数 ÷ 所有等可能结果数。"],
      examples: ["袋子里有 3 个红球、2 个白球，随机摸出 1 个球，求摸到红球的概率。"]
    }
  ];

  function answerText(value, unit = "") {
    return `${round(value, 2)}${unit}`;
  }

  function squaredUnit(unit) {
    return `平方${unit}`;
  }

  function questionResult(question, answer, options = {}) {
    return {
      question,
      answer,
      steps: options.steps || [],
      explanation: options.explanation || "先识别题目中的已知条件，再选择对应公式或规则求解。",
      ...options
    };
  }

  function generateQuestion(modelId) {
    const unit = choice(["厘米", "米", "毫米"]);
    const a = randomInt(2, 9);
    const b = randomInt(2, 9);
    const c = randomInt(2, 12);

    switch (modelId) {
      case "rational-number": {
        const x = randomInt(-15, -3);
        const y = randomInt(4, 18);
        const z = randomInt(2, 10);
        const value = x + y - z;
        return questionResult(
          `计算：${x} + ${y} - ${z} = ?`,
          `${value}`,
          {
            answerValue: value,
            tolerance: 0.01,
            steps: [`先算 ${x} + ${y} = ${x + y}`, `再算 ${x + y} - ${z} = ${value}`],
            explanation: "有理数加减可以按顺序计算，注意负号和减号。"
          }
        );
      }
      case "polynomial-add-sub": {
        const m = randomInt(2, 8);
        const n = randomInt(2, 8);
        const p = randomInt(1, 5);
        const value = m + n - p;
        return questionResult(
          `合并同类项：${m}x + ${n}x - ${p}x`,
          `${value}x`,
          {
            answerValue: value,
            acceptedTexts: [`${value}x`],
            steps: [`系数相加：${m}+${n}-${p}=${value}`, `字母 x 不变，所以结果是 ${value}x`],
            explanation: "合并同类项时，只把系数相加减，字母部分保持不变。"
          }
        );
      }
      case "linear-equation-one": {
        const solution = randomInt(2, 12);
        const k = randomInt(2, 6);
        const d = randomInt(1, 15);
        const right = k * solution + d;
        return questionResult(
          `解方程：${k}x + ${d} = ${right}`,
          `x=${solution}`,
          {
            answerValue: solution,
            acceptedTexts: [`x=${solution}`],
            steps: [`移项：${k}x = ${right} - ${d} = ${right - d}`, `系数化为 1：x = ${solution}`],
            explanation: "一元一次方程先移项，再把未知数的系数化为 1。"
          }
        );
      }
      case "basic-geometry": {
        const type = choice(["线段", "射线", "直线"]);
        const label = choice(["AB", "CD", "MN", "PQ", "EF", "GH", "OP"]);
        const answer = type === "线段" ? "两个端点" : type === "射线" ? "一个端点" : "没有端点";
        return questionResult(
          `${type} ${label} 有几个端点？`,
          answer,
          {
            acceptedTexts: [answer, answer.replace("个端点", "")],
            steps: [`回忆 ${type} 的定义`, `${type}的端点情况是：${answer}`],
            explanation: "几何图形初步要先抓住基本概念：线段、射线、直线的端点个数不同。"
          }
        );
      }
      case "parallel-lines": {
        const angle = randomInt(35, 145);
        return questionResult(
          `两条直线平行，被第三条直线所截。若一个同位角为 ${angle}°，求它的另一个同位角。`,
          `${angle}°`,
          {
            answerValue: angle,
            tolerance: 0.01,
            steps: ["两直线平行，同位角相等", `所以另一个同位角也是 ${angle}°`],
            explanation: "平行线性质题要先判断角之间的关系，再使用对应性质。"
          }
        );
      }
      case "real-number": {
        const root = randomInt(4, 15);
        const square = root * root;
        return questionResult(
          `求 ${square} 的算术平方根。`,
          `${root}`,
          {
            answerValue: root,
            tolerance: 0.01,
            steps: [`因为 ${root}² = ${square}`, `所以 ${square} 的算术平方根是 ${root}`],
            explanation: "算术平方根是非负平方根。"
          }
        );
      }
      case "coordinate-system": {
        const x = randomInt(-8, 8) || 3;
        const y = randomInt(-8, 8) || -4;
        const quadrant = x > 0 && y > 0 ? "第一象限" : x < 0 && y > 0 ? "第二象限" : x < 0 && y < 0 ? "第三象限" : "第四象限";
        return questionResult(
          `点 P(${x}, ${y}) 在第几象限？`,
          quadrant,
          {
            acceptedTexts: [quadrant],
            steps: [`横坐标 x=${x}，纵坐标 y=${y}`, `根据 x、y 的正负判断，点在${quadrant}`],
            explanation: "判断象限时，看横坐标和纵坐标的正负。"
          }
        );
      }
      case "linear-equations-two": {
        const x = randomInt(2, 10);
        const y = randomInt(2, 10);
        return questionResult(
          `解方程组：\nx + y = ${x + y}\nx - y = ${x - y}`,
          `x=${x}, y=${y}`,
          {
            answerNumbers: [x, y],
            tolerance: 0.01,
            acceptedTexts: [`x=${x}`, `y=${y}`],
            steps: [`两式相加：2x=${2 * x}`, `所以 x=${x}`, `代入 x+y=${x + y}，得 y=${y}`],
            explanation: "这个方程组适合用加减消元，先消去 y。"
          }
        );
      }
      case "inequality": {
        const solution = randomInt(3, 10);
        const k = randomInt(2, 5);
        const d = randomInt(1, 9);
        const right = k * solution + d;
        return questionResult(
          `解不等式：${k}x + ${d} > ${right}`,
          `x>${solution}`,
          {
            answerValue: solution,
            acceptedTexts: [`x>${solution}`, `x＞${solution}`],
            steps: [`移项：${k}x > ${right - d}`, `两边除以 ${k}，得 x > ${solution}`],
            explanation: "两边同除以正数时，不等号方向不变。"
          }
        );
      }
      case "data-collection": {
        const total = choice([30, 40, 50, 60]);
        const count = randomInt(5, total / 2);
        const rate = round((count / total) * 100);
        return questionResult(
          `一次调查共有 ${total} 人，其中喜欢篮球的有 ${count} 人。喜欢篮球的人占百分之多少？`,
          `${rate}%`,
          {
            answerValue: Number(rate),
            tolerance: 0.01,
            steps: [`百分比 = ${count} ÷ ${total} × 100%`, `结果是 ${rate}%`],
            explanation: "求百分比时，用部分数量除以总数量。"
          }
        );
      }
      case "triangle": {
        const base = randomInt(4, 24);
        const height = randomInt(3, 20);
        const value = (base * height) / 2;
        return questionResult(
          `一个三角形底为 ${base}${unit}，高为 ${height}${unit}，求面积。`,
          answerText(value, squaredUnit(unit)),
          {
            answerValue: value,
            tolerance: Math.max(0.05, value * 0.02),
            steps: [`三角形面积 = 底 × 高 ÷ 2`, `S=${base}×${height}÷2=${round(value)}${squaredUnit(unit)}`],
            explanation: "三角形面积等于同底同高长方形面积的一半。"
          }
        );
      }
      case "congruent-triangle": {
        const rule = choice(["SSS", "SAS", "ASA", "AAS", "HL"]);
        return questionResult(
          `两个三角形满足 ${rule} 条件，能否判定它们全等？`,
          "能",
          {
            acceptedTexts: ["能", "可以", "能判定", "全等"],
            steps: [`${rule} 是全等三角形的常用判定方法`, "所以可以判定两个三角形全等"],
            explanation: "全等判定题要识别题目给出的边角条件是否符合判定定理。"
          }
        );
      }
      case "symmetry": {
        const distance = randomInt(2, 12);
        return questionResult(
          `点 A 到对称轴的距离是 ${distance}${unit}，它的对称点 A' 到对称轴的距离是多少？`,
          `${distance}${unit}`,
          {
            answerValue: distance,
            tolerance: 0.01,
            steps: ["轴对称点到对称轴的距离相等", `所以 A' 到对称轴的距离也是 ${distance}${unit}`],
            explanation: "轴对称的关键性质是对应点到对称轴距离相等。"
          }
        );
      }
      case "isosceles-triangle": {
        const top = choice([30, 40, 50, 70, 80]);
        const baseAngle = (180 - top) / 2;
        return questionResult(
          `等腰三角形的顶角为 ${top}°，求每个底角。`,
          `${baseAngle}°`,
          {
            answerValue: baseAngle,
            tolerance: 0.01,
            steps: ["等腰三角形两个底角相等", `底角 = (180°-${top}°)÷2 = ${baseAngle}°`],
            explanation: "等腰三角形使用“两底角相等”和“三角形内角和 180°”。"
          }
        );
      }
      case "polynomial-multiply": {
        const m = randomInt(2, 6);
        const n = randomInt(2, 6);
        const coef = a * b;
        return questionResult(
          `计算：${a}x^${m} × ${b}x^${n}`,
          `${coef}x^${m + n}`,
          {
            answerValue: coef,
            acceptedTexts: [`${coef}x^${m + n}`, `${coef}x${m + n}`],
            steps: [`系数相乘：${a}×${b}=${coef}`, `同底数幂指数相加：x^${m}×x^${n}=x^${m + n}`],
            explanation: "单项式乘法要分别处理系数和同底数幂。"
          }
        );
      }
      case "multiplication-formula": {
        const n = randomInt(2, 12);
        return questionResult(
          `计算：(x + ${n})(x - ${n})`,
          `x² - ${n * n}`,
          {
            answerValue: n * n,
            acceptedTexts: [`x²-${n * n}`, `x^2-${n * n}`],
            steps: ["使用平方差公式：(a+b)(a-b)=a²-b²", `结果为 x²-${n}² = x²-${n * n}`],
            explanation: "看到一加一减的两个括号，可以优先考虑平方差公式。"
          }
        );
      }
      case "factorization": {
        const n = randomInt(2, 12);
        return questionResult(
          `分解因式：x² - ${n * n}`,
          `(x + ${n})(x - ${n})`,
          {
            answerValue: n,
            acceptedTexts: [`(x+${n})(x-${n})`, `(x-${n})(x+${n})`],
            steps: [`${n * n}=${n}²`, "使用平方差公式 a²-b²=(a+b)(a-b)", `x²-${n * n}=(x+${n})(x-${n})`],
            explanation: "平方差形式可以直接用公式分解。"
          }
        );
      }
      case "fraction-expression": {
        const n = randomInt(2, 9);
        return questionResult(
          `若分式 1/(x-${n}) 有意义，x 不能等于多少？`,
          `${n}`,
          {
            answerValue: n,
            tolerance: 0.01,
            steps: ["分式有意义要求分母不等于 0", `x-${n}≠0`, `所以 x≠${n}`],
            explanation: "分式题首先检查分母不能为 0。"
          }
        );
      }
      case "quadratic-radical": {
        const n = randomInt(2, 10);
        return questionResult(
          `若 √(x-${n}) 有意义，x 应满足什么条件？`,
          `x≥${n}`,
          {
            answerValue: n,
            acceptedTexts: [`x≥${n}`, `x>=${n}`],
            steps: ["二次根式有意义要求被开方数大于等于 0", `x-${n}≥0`, `所以 x≥${n}`],
            explanation: "二次根式的被开方数不能是负数。"
          }
        );
      }
      case "pythagorean-theorem": {
        const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25]];
        const [x, y, hypotenuse] = choice(triples);
        return questionResult(
          `直角三角形两条直角边分别是 ${x} 和 ${y}，求斜边。`,
          `${hypotenuse}`,
          {
            answerValue: hypotenuse,
            tolerance: 0.01,
            steps: [`c²=${x}²+${y}²=${x * x + y * y}`, `c=${hypotenuse}`],
            explanation: "勾股定理用于直角三角形：两直角边平方和等于斜边平方。"
          }
        );
      }
      case "parallelogram": {
        const base = randomInt(4, 16);
        const height = randomInt(3, 12);
        const value = base * height;
        return questionResult(
          `平行四边形底为 ${base}${unit}，高为 ${height}${unit}，求面积。`,
          answerText(value, squaredUnit(unit)),
          {
            answerValue: value,
            tolerance: 0.01,
            steps: [`面积 = 底 × 高`, `S=${base}×${height}=${value}${squaredUnit(unit)}`],
            explanation: "平行四边形面积和同底同高长方形面积相等。"
          }
        );
      }
      case "rectangle": {
        const length = randomInt(4, 18);
        const width = randomInt(2, 12);
        const value = length * width;
        return questionResult(
          `矩形长 ${length}${unit}，宽 ${width}${unit}，求面积。`,
          answerText(value, squaredUnit(unit)),
          {
            answerValue: value,
            tolerance: 0.01,
            steps: [`面积 = 长 × 宽`, `S=${length}×${width}=${value}${squaredUnit(unit)}`],
            explanation: "矩形面积等于长乘宽。"
          }
        );
      }
      case "rhombus": {
        const d1 = randomInt(6, 18);
        const d2 = randomInt(4, 16);
        const value = (d1 * d2) / 2;
        return questionResult(
          `菱形两条对角线分别为 ${d1}${unit} 和 ${d2}${unit}，求面积。`,
          answerText(value, squaredUnit(unit)),
          {
            answerValue: value,
            tolerance: 0.01,
            steps: [`面积 = 两条对角线乘积 ÷ 2`, `S=${d1}×${d2}÷2=${round(value)}${squaredUnit(unit)}`],
            explanation: "菱形面积可以用两条对角线乘积的一半来求。"
          }
        );
      }
      case "square": {
        const side = randomInt(3, 15);
        const mode = choice(["area", "perimeter"]);
        const value = mode === "area" ? side * side : side * 4;
        return questionResult(
          `正方形边长为 ${side}${unit}，求${mode === "area" ? "面积" : "周长"}。`,
          answerText(value, mode === "area" ? squaredUnit(unit) : unit),
          {
            answerValue: value,
            tolerance: 0.01,
            steps: [mode === "area" ? "面积 = 边长²" : "周长 = 4 × 边长", `结果是 ${round(value)}`],
            explanation: "正方形四边相等，面积看平方，周长看四条边总长。"
          }
        );
      }
      case "linear-function": {
        const k = randomInt(1, 6);
        const d = randomInt(-6, 8);
        const x = randomInt(2, 8);
        const value = k * x + d;
        return questionResult(
          `已知一次函数 y = ${k}x ${d >= 0 ? "+" : "-"} ${Math.abs(d)}，求 x=${x} 时 y 的值。`,
          `${value}`,
          {
            answerValue: value,
            tolerance: 0.01,
            steps: [`代入 x=${x}`, `y=${k}×${x}${d >= 0 ? "+" : "-"}${Math.abs(d)}=${value}`],
            explanation: "一次函数求值就是把 x 的值代入函数表达式。"
          }
        );
      }
      case "data-analysis": {
        const n1 = randomInt(2, 12);
        const n2 = randomInt(2, 12);
        const n3 = randomInt(2, 12);
        const value = round((n1 + n2 + n3) / 3);
        return questionResult(
          `求数据 ${n1}、${n2}、${n3} 的平均数。`,
          `${value}`,
          {
            answerValue: Number(value),
            tolerance: 0.01,
            steps: [`平均数 = (${n1}+${n2}+${n3})÷3`, `结果是 ${value}`],
            explanation: "平均数表示一组数据的总体水平。"
          }
        );
      }
      case "quadratic-equation": {
        const r1 = randomInt(1, 8);
        const r2 = randomInt(1, 8);
        const sum = r1 + r2;
        const product = r1 * r2;
        return questionResult(
          `解方程：x² - ${sum}x + ${product} = 0`,
          `x=${r1} 或 x=${r2}`,
          {
            answerNumbers: [r1, r2],
            tolerance: 0.01,
            acceptedTexts: [`x=${r1}`, `x=${r2}`],
            steps: [`分解因式：(x-${r1})(x-${r2})=0`, `所以 x=${r1} 或 x=${r2}`],
            explanation: "能因式分解的一元二次方程，可以令每个因式等于 0。"
          }
        );
      }
      case "quadratic-function": {
        const h = randomInt(-5, 5);
        const k = randomInt(-6, 6);
        const coef = choice([1, 2, -1, -2]);
        const open = coef > 0 ? "向上" : "向下";
        const mode = choice(["axis", "vertex", "open"]);
        const formula = `y=${coef}(x${h < 0 ? "+" : "-"}${Math.abs(h)})²${k >= 0 ? "+" : ""}${k}`;
        if (mode === "vertex") {
          return questionResult(`已知二次函数 ${formula}，求顶点坐标。`, `(${h}, ${k})`, {
            answerNumbers: [h, k],
            tolerance: 0.01,
            steps: ["顶点式为 y=a(x-h)²+k", `所以顶点是 (${h}, ${k})`],
            explanation: "顶点式可以直接读出顶点坐标。"
          });
        }
        if (mode === "open") {
          return questionResult(`已知二次函数 ${formula}，判断开口方向。`, open, {
            acceptedTexts: [open],
            steps: [`a=${coef}`, `a ${coef > 0 ? ">" : "<"} 0，所以开口${open}`],
            explanation: "二次函数开口方向由 a 的正负决定。"
          });
        }
        return questionResult(`已知二次函数 ${formula}，求对称轴。`, `x=${h}`, {
          answerValue: h,
          acceptedTexts: [`x=${h}`, `x＝${h}`],
          tolerance: 0.01,
          steps: ["顶点式 y=a(x-h)²+k 的对称轴是 x=h", `所以对称轴是 x=${h}`],
          explanation: "抛物线的对称轴经过顶点。"
        });
      }
      case "inverse-function": {
        const x = randomInt(2, 8);
        const y = randomInt(2, 9);
        const k = x * y;
        return questionResult(
          `已知反比例函数 y=${k}/x，求 x=${x} 时 y 的值。`,
          `${y}`,
          {
            answerValue: y,
            tolerance: 0.01,
            steps: [`代入 x=${x}`, `y=${k}÷${x}=${y}`],
            explanation: "反比例函数求值时，把 x 代入 y=k/x。"
          }
        );
      }
      case "circle": {
        const radius = randomInt(2, 18);
        const mode = choice(["area", "circumference"]);
        const value = mode === "area" ? pi * radius * radius : 2 * pi * radius;
        return questionResult(
          `半径为 ${radius}${unit} 的圆，求它的${mode === "area" ? "面积" : "周长"}。`,
          answerText(value, mode === "area" ? squaredUnit(unit) : unit),
          {
            answerValue: Number(round(value, 2)),
            tolerance: Math.max(0.1, value * 0.02),
            steps: [mode === "area" ? "圆面积公式：S=πr²" : "圆周长公式：C=2πr", `代入 r=${radius}，结果约为 ${round(value, 2)}`],
            explanation: "圆的面积与半径平方有关，周长与半径成正比。"
          }
        );
      }
      case "sector": {
        const radius = randomInt(2, 15);
        const angle = randomInt(2, 20) * 15;
        const mode = choice(["area", "arc"]);
        const value = mode === "area" ? (angle / 360) * pi * radius * radius : (angle / 360) * 2 * pi * radius;
        return questionResult(
          `扇形半径为 ${radius}${unit}，圆心角为 ${angle}°，求${mode === "area" ? "扇形面积" : "弧长"}。`,
          answerText(value, mode === "area" ? squaredUnit(unit) : unit),
          {
            answerValue: Number(round(value, 2)),
            tolerance: Math.max(0.1, value * 0.03),
            steps: [mode === "area" ? "S=θ/360°×πr²" : "L=θ/360°×2πr", `代入 θ=${angle}°，r=${radius}，结果约为 ${round(value, 2)}`],
            explanation: "扇形是整圆的一部分，按圆心角占 360° 的比例来计算。"
          }
        );
      }
      case "similar-triangle": {
        const smallRatio = randomInt(2, 5);
        const bigRatio = smallRatio + randomInt(1, 4);
        const smallSide = randomInt(4, 12);
        const bigSide = (smallSide * bigRatio) / smallRatio;
        return questionResult(
          `两个相似三角形的相似比为 ${smallRatio}:${bigRatio}，小三角形一边为 ${smallSide}，求对应大三角形边长。`,
          `${round(bigSide)}`,
          {
            answerValue: Number(round(bigSide)),
            tolerance: 0.01,
            steps: [`对应边成比例：大边 = ${smallSide}×${bigRatio}÷${smallRatio}`, `结果是 ${round(bigSide)}`],
            explanation: "相似三角形对应边的比等于相似比。"
          }
        );
      }
      case "trigonometry": {
        const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 12, 15], [12, 16, 20]];
        const [opposite, adjacent, hypotenuse] = choice(triples);
        const mode = choice(["sin", "cos", "tan"]);
        const value = mode === "sin" ? round(opposite / hypotenuse) : mode === "cos" ? round(adjacent / hypotenuse) : round(opposite / adjacent);
        const knownText = mode === "sin"
          ? `sinA = 对边 / 斜边。已知对边为 ${opposite}，斜边为 ${hypotenuse}`
          : mode === "cos"
            ? `cosA = 邻边 / 斜边。已知邻边为 ${adjacent}，斜边为 ${hypotenuse}`
            : `tanA = 对边 / 邻边。已知对边为 ${opposite}，邻边为 ${adjacent}`;
        return questionResult(
          `直角三角形中，${knownText}，求 ${mode}A。`,
          `${value}`,
          {
            answerValue: Number(value),
            tolerance: 0.01,
            steps: [mode === "sin" ? `sinA = ${opposite} ÷ ${hypotenuse}` : mode === "cos" ? `cosA = ${adjacent} ÷ ${hypotenuse}` : `tanA = ${opposite} ÷ ${adjacent}`, `${mode}A = ${value}`],
            explanation: "锐角三角函数表示直角三角形中两条边的比值。"
          }
        );
      }
      case "projection-view": {
        const length = randomInt(4, 10);
        const height = randomInt(2, 8);
        return questionResult(
          `一个长方体长 ${length}、宽 ${randomInt(2, 7)}、高 ${height}。从正面看，主视图是什么形状？`,
          "长方形",
          {
            acceptedTexts: ["长方形", "矩形"],
            steps: ["主视图是从正面看到的图形", "长方体从正面看通常是长方形"],
            explanation: "三视图题要先明确观察方向。"
          }
        );
      }
      case "probability": {
        const red = randomInt(2, 8);
        const white = randomInt(2, 8);
        const total = red + white;
        const value = round(red / total);
        return questionResult(
          `袋子里有 ${red} 个红球、${white} 个白球，随机摸出 1 个球，求摸到红球的概率。`,
          `${red}/${total}，约 ${value}`,
          {
            answerValue: Number(value),
            tolerance: 0.01,
            steps: [`总球数 = ${red}+${white}=${total}`, `概率 = 红球数 ÷ 总球数 = ${red}/${total}`],
            explanation: "等可能事件的概率等于目标结果数除以所有可能结果数。"
          }
        );
      }
      default: {
        const model = models.find((item) => item.id === modelId);
        const tag = choice(model?.tags || ["核心概念"]);
        return questionResult(
          `请写出「${model?.title || "当前知识点"}」中与“${tag}”有关的一个核心规则。`,
          model?.formula?.[0] || "根据定义或公式回答。",
          {
            acceptedTexts: [tag],
            steps: ["回忆本知识点的核心定义", "写出对应公式或规则"],
            explanation: "基础概念题适合先从定义和关键词入手。"
          }
        );
      }
    }
  }

  const customInteractiveTemplates = {
    "rational-number": "number-line",
    "polynomial-add-sub": "algebra-tiles",
    "linear-equation-one": "equation-balance",
    "basic-geometry": "angle-lines",
    "real-number": "number-line",
    "linear-equations-two": "equation-balance",
    inequality: "number-line",
    "data-collection": "data-chart",
    "congruent-triangle": "triangle-ratio",
    symmetry: "symmetry-mirror",
    "isosceles-triangle": "shape-area",
    "polynomial-multiply": "algebra-tiles",
    "multiplication-formula": "algebra-tiles",
    factorization: "algebra-tiles",
    "fraction-expression": "fraction-bars",
    "quadratic-radical": "fraction-bars",
    parallelogram: "shape-area",
    rectangle: "shape-area",
    rhombus: "shape-area",
    square: "shape-area",
    "data-analysis": "data-chart",
    "quadratic-equation": "function-mini-graph",
    "inverse-function": "function-mini-graph",
    "similar-triangle": "triangle-ratio",
    trigonometry: "triangle-ratio",
    "projection-view": "view-3d",
    probability: "probability-simulator"
  };

  const interactiveDescriptions = {
    "number-line": "拖动数轴上的数，观察大小、绝对值和区间变化。",
    "equation-balance": "拖动未知数取值，观察方程两边是否平衡。",
    "algebra-tiles": "点击生成表达式，用代数块观察合并与面积关系。",
    "fraction-bars": "拖动分子分母或根式参数，观察等值与化简过程。",
    "angle-lines": "拖动角度滑块，观察角、射线和直线的变化。",
    "symmetry-mirror": "拖动左侧点，观察它关于对称轴的镜像点。",
    "shape-area": "拖动图形参数，观察面积、周长和形状关系。",
    "data-chart": "生成一组数据，观察统计量和柱状图变化。",
    "probability-simulator": "调整红球白球数量，模拟随机摸球并观察频率。",
    "function-mini-graph": "拖动函数参数，观察图像和关键点变化。",
    "triangle-ratio": "拖动比例或角度，观察三角形对应关系。",
    "view-3d": "切换观察方向，理解立体图形的三视图。"
  };

  models.forEach((model) => {
    if (!model.geoGebra) {
      model.geoGebra = { enabled: false };
    }

    if (model.geoGebra.enabled) {
      model.interactive = {
        enabled: true,
        type: "geogebra",
        template: model.geoGebra.construction || model.id,
        title: "互动探索",
        description: model.geoGebra.description || "拖动参数，观察图形与公式变化。"
      };
      return;
    }

    const template = customInteractiveTemplates[model.id];
    model.interactive = {
      enabled: Boolean(template),
      type: template ? "custom" : "placeholder",
      template: template || "placeholder",
      title: "互动探索",
      description: interactiveDescriptions[template] || "通过互动卡片观察这个知识点的核心变化。"
    };
  });

  window.MathCoursewareModels = {
    models,
    getModel(id) {
      return models.find((model) => model.id === id);
    },
    generateQuestion,
    round
  };
})();
