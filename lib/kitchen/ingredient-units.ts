/**
 * 食材常用“通俗买菜量词”换算表。
 *
 * 目标：在采购清单里，既能看到标准克数（便于精确比对菜谱），
 * 也能看到菜市场/超市里的通俗叫法（约 X 个 / 约 X 块 / 约 X 根 / 约 X 颗）。
 *
 * 设计约定：
 *   - 内部“参考量”全部用克(g)。体积单位 ml -> 近似 1:1 克处理（液体只做粗估，不用于称重）。
 *   - “量词”统一用中国家庭买菜最常用的：个 / 块 / 根 / 颗 / 粒 / 头 / 瓣 / 听 / 勺 / 茶匙 / 包 / 瓶 / 把 / 张 / 小段 等。
 *   - keywords 任意一个命中即可（按更严格的长关键词先匹配，避免“姜”误匹配到“生姜粉”）。
 */

export interface IngredientUnitHint {
  /** 一个（或一根 / 一块 / 一颗）的参考克数。 */
  gramsPerUnit: number;
  /** 通俗量词：个 / 块 / 根 / 颗 / 粒 / 瓣 / 听 / … */
  colloidalUnit: string;
  /** 食材命中关键词（按从长到短在运行时排序后匹配）。 */
  keywords: string[];
  /** 用于 UI 的备注，比如：「大 200g / 小 100g」说明换算来源，目前仅注释。 */
  remark?: string;
}

/**
 * 参考值来源：常见菜市场经验 + 家庭菜谱通用估算。
 * 用户给出的基准优先（严格遵守）：
 *   - 青椒  20g / 个  → 100克 约 5个
 *   - 生姜  50g / 块  → 100克 约 2块
 *   - 小葱  10g / 根  →  50克 约 5根
 *   - 鸡蛋  10g / 颗  → 100克 约10颗（注意：通常鸡蛋 50g/颗，此处为用户强调的“颗级小颗粒口径”，用于“颗”的通俗提示。
 *         同时保留 50g/个 的“按个”粗估作为 fallback，避免歧义。）
 */
export const INGREDIENT_UNIT_HINTS: IngredientUnitHint[] = [
  // —— 用户明确约定的三个核心样例 ——
  {
    gramsPerUnit: 20,
    colloidalUnit: "个",
    keywords: ["青椒", "菜椒", "圆椒", "甜椒", "辣椒"],
    remark: "菜场常见小青椒约20g / 个",
  },
  {
    gramsPerUnit: 50,
    colloidalUnit: "块",
    keywords: ["生姜", "老姜", "子姜", "姜块"],
    remark: "100克≈2块，用户基准",
  },
  {
    gramsPerUnit: 10,
    colloidalUnit: "根",
    keywords: ["小葱", "香葱", "青葱"],
    remark: "50克≈5根，用户基准",
  },

  // —— 其它常见蔬菜 ——
  {
    gramsPerUnit: 150,
    colloidalUnit: "个",
    keywords: ["土豆", "马铃薯"],
    remark: "中等土豆约150g / 个",
  },
  {
    gramsPerUnit: 75,
    colloidalUnit: "根",
    keywords: ["胡萝卜"],
    remark: "75g / 根",
  },
  {
    gramsPerUnit: 200,
    colloidalUnit: "根",
    keywords: ["茄子"],
    remark: "长茄子约200g / 根",
  },
  {
    gramsPerUnit: 200,
    colloidalUnit: "个",
    keywords: ["番茄", "西红柿"],
    remark: "中等番茄约200g / 个",
  },
  {
    gramsPerUnit: 500,
    colloidalUnit: "颗",
    keywords: ["大白菜", "黄芽白", "包菜", "卷心菜", "圆白菜", "莲花白", "高丽菜"],
    remark: "半颗约500g",
  },
  {
    gramsPerUnit: 150,
    colloidalUnit: "根",
    keywords: ["玉米", "玉米棒"],
  },
  {
    gramsPerUnit: 400,
    colloidalUnit: "把",
    keywords: ["广东菜心", "菜心", "上海青", "小白菜", "青菜", "油麦菜", "生菜", "菠菜", "空心菜", "韭菜", "韭黄"],
    remark: "菜场一捆/一把约400g",
  },
  {
    gramsPerUnit: 100,
    colloidalUnit: "个",
    keywords: ["洋葱"],
  },
  {
    gramsPerUnit: 5,
    colloidalUnit: "根",
    keywords: ["香菜"],
  },

  // —— 葱姜蒜 / 香辛料 ——
  {
    gramsPerUnit: 5,
    colloidalUnit: "瓣",
    keywords: ["大蒜", "蒜头", "蒜瓣"],
    remark: "1瓣蒜≈5g，1头≈40g",
  },
  {
    gramsPerUnit: 5,
    colloidalUnit: "粒",
    keywords: ["花椒"],
    remark: "颗粒约 16 粒 = 1g；这里按“小撮 5g/份”使用粒级提示。",
  },
  {
    gramsPerUnit: 2,
    colloidalUnit: "个",
    keywords: ["干辣椒", "干椒", "小米辣"],
    remark: "小干辣椒约 2g / 个",
  },
  {
    gramsPerUnit: 5,
    colloidalUnit: "片",
    keywords: ["桂皮"],
    remark: "小块桂皮约 3–8g",
  },
  {
    gramsPerUnit: 4,
    colloidalUnit: "个",
    keywords: ["八角", "大料"],
  },

  // —— 鸡蛋 / 禽肉 ——
  {
    gramsPerUnit: 10,
    colloidalUnit: "颗",
    keywords: ["鸡蛋"],
    remark: "用户口径：100克约10颗（颗级小颗粒习惯）",
  },
  {
    gramsPerUnit: 50,
    colloidalUnit: "个",
    keywords: ["鸡蛋"],
    remark: "备用：超市常见 50g/个。运行时会同时给“颗/个”两种口径，按单位近的优先。",
  },
  {
    gramsPerUnit: 30,
    colloidalUnit: "个",
    keywords: ["鸡翅", "鸡中翅", "鸡翅中"],
    remark: "鸡中翅约 25–35g / 个",
  },

  // —— 干货 / 豆制品 / 主食 ——
  {
    gramsPerUnit: 500,
    colloidalUnit: "包",
    keywords: ["挂面", "干面条"],
  },
  {
    gramsPerUnit: 250,
    colloidalUnit: "盒",
    keywords: ["嫩豆腐", "北豆腐", "南豆腐", "豆腐"],
  },
  {
    gramsPerUnit: 20,
    colloidalUnit: "张",
    keywords: ["千张", "豆皮", "豆腐皮"],
  },

  // —— 液体 / 瓶听装（粗估，ml ≈ g，仅为通俗提示） ——
  {
    gramsPerUnit: 330,
    colloidalUnit: "听",
    keywords: ["可乐", "雪碧", "芬达", "苏打水", "气泡水"],
    remark: "易拉罐 330ml / 听",
  },
  {
    gramsPerUnit: 500,
    colloidalUnit: "瓶",
    keywords: ["矿泉水", "饮用水", "瓶装水"],
  },
];

/** 基础单位同义词 → 标准口径 */
const UNIT_ALIASES: Record<string, string> = {
  g: "克",
  G: "克",
  ml: "克",
  ML: "克",
  mL: "克",
  公克: "克",
  千克: "千克",
  kg: "千克",
  KG: "千克",
};

export function normalizeUnit(raw: string): string {
  const u = (raw || "").trim();
  if (!u) return "适量";
  return UNIT_ALIASES[u] ?? u;
}

/** 中文数字（极少量场景）兼容，通常数量已经是 number，此为回退。 */
export function toNumber(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(v);
  if (Number.isFinite(n)) return n;
  return null;
}

/** 在 hint 表命中食材。keywords 按长度从长到短匹配，避免“姜”先匹配到“生姜粉”。 */
export function matchIngredientHints(name: string): IngredientUnitHint[] {
  const n = (name || "").trim();
  if (!n) return [];
  const matched: IngredientUnitHint[] = [];
  for (const h of INGREDIENT_UNIT_HINTS) {
    const kws = [...h.keywords].sort((a, b) => b.length - a.length);
    if (kws.some((k) => k && n.includes(k))) matched.push(h);
  }
  // 对相同 colloidalUnit 的，优先返回 gramsPerUnit 更小的（更贴近用户约定的小颗粒口径）
  return matched.sort((a, b) => {
    if (a.colloidalUnit === b.colloidalUnit) return a.gramsPerUnit - b.gramsPerUnit;
    return 0;
  });
}

/**
 * 把一个「数值 + 通俗量词 / 或其它常用量词」按食材名反推为克数。
 * 用于买菜清单里的「来源是“3个青椒”」这种，想展示为「约 60克（约3个）」。
 * 目前仅用于 UI 的补充展示，不影响数据库聚合。
 */
export function colloidalToGrams(
  name: string,
  quantity: number,
  colloidalUnit: string
): number | null {
  const unit = (colloidalUnit || "").trim();
  if (!unit || !Number.isFinite(quantity)) return null;
  const matched = matchIngredientHints(name).filter((h) => h.colloidalUnit === unit);
  if (!matched.length) {
    // 对“个/根/块/颗/瓣/粒/片/张/把”等的兜底：至少给一些生活经验值
    const fallback = fallbackGramsPerUnitFor(colloidalUnit, name);
    return fallback ? round2(quantity * fallback) : null;
  }
  const pick = matched[0];
  return round2(quantity * pick.gramsPerUnit);
}

function fallbackGramsPerUnitFor(unit: string, name: string): number | null {
  switch (unit) {
    case "个":
      if (name.includes("鸡蛋")) return 50;
      if (name.includes("番茄") || name.includes("西红柿")) return 200;
      if (name.includes("土豆") || name.includes("马铃薯")) return 150;
      if (name.includes("洋葱")) return 100;
      if (name.includes("鸡翅")) return 30;
      return 80;
    case "根":
      if (name.includes("小葱") || name.includes("香菜")) return 10;
      if (name.includes("胡萝")) return 75;
      if (name.includes("茄子")) return 200;
      if (name.includes("玉米")) return 150;
      return 60;
    case "块":
      return 50;
    case "颗":
      if (name.includes("鸡蛋")) return 10;
      return 5;
    case "瓣":
      return 5;
    case "粒":
      return 0.5;
    case "听":
      return 330;
    case "瓶":
      return 500;
    case "茶匙":
      return 5;
    case "勺":
    case "汤匙":
    case "大勺":
      return 15;
    case "小勺":
    case "茶匙":
      return 5;
    default:
      return null;
  }
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function roundQuantity(n: number): number {
  if (n >= 1000) return Math.round(n / 100) * 100;
  if (n >= 100) return Math.round(n / 10) * 10;
  if (n >= 10) return Math.round(n);
  if (n >= 1) return Math.round(n * 10) / 10;
  return Math.round(n * 100) / 100;
}

function smartPluralize(unit: string, count: number): string {
  if (count <= 1) return unit;
  // 这些中文量词单复数同形，且 1以上 依然读着自然
  return unit;
}

export interface FormattedQuantity {
  /** 克数部分的展示文本，如“100克”或“约60克” */
  gramsText: string;
  /** 通俗叫法提示，如“约5个”或“约3块”；如果没有合适换算则为空字符串 */
  colloidalText: string;
  /** 组合文本，如“100克（约5个）”或仅 “100克”；也兼容“约60克（约3个）” */
  combined: string;
}

/**
 * 给采购清单 UI 用的主格式化入口。
 *
 * 策略：
 *  1) 若 item.unit 是“克/g/ml/千克/kg”：把 total 当成克数（千克先×1000），输出「X克（约Y量词）」。
 *  2) 若 item.unit 是“个/根/块/颗/瓣/粒/张/把/听/瓶/勺/茶匙”等常用量词：
 *     - 先反算成克数：克=total * 表中参考/兜底
 *     - 输出「约 N克（约 M量词）」。
 *     - 反算失败就只展示「total + unit」（保留来源菜谱手写备注）。
 *  3) 其它单位（“适量”“少许”“杯”“小块”等）：保持原样，附上来源 note（如果写了）。
 */
export function formatShoppingQuantity(input: {
  name: string;
  totalQuantity: number | null;
  unit: string;
  sources?: Array<{ note?: string }>;
}): FormattedQuantity {
  const name = (input.name || "").trim();
  const stdUnit = normalizeUnit(input.unit);
  const total = toNumber(input.totalQuantity);
  const sourceNote = (input.sources ?? []).map((s) => s.note?.trim()).find((n) => n && n.length > 0) ?? "";

  // —— Case 1: 没有数值 ——
  if (total === null) {
    const combined = sourceNote ? `${stdUnit}（${sourceNote}）` : stdUnit;
    return { gramsText: "", colloidalText: sourceNote, combined };
  }

  // —— Case 2: 质量/体积单位 → 主展示克数 + 通俗提示 ——
  if (stdUnit === "千克" || stdUnit === "kg") {
    const grams = roundQuantity(total * 1000);
    return buildFromGrams(name, grams, sourceNote, "kg");
  }
  if (stdUnit === "克") {
    const grams = roundQuantity(total);
    // 500克倍数优先给“1斤/2斤”的通俗习惯，保留同时 show 克
    return buildFromGrams(name, grams, sourceNote, "g");
  }

  // —— Case 3: 常见通俗量词（个/根/块/颗/瓣/粒/张/把/听/瓶/勺/茶匙…）→ 先反算克数 ——
  const colloidalUnits = new Set([
    "个","根","块","颗","粒","瓣","张","把","听","瓶","盒","包","片","段","小节","小段","勺","汤匙","大勺","小勺","茶匙","茶匙","只","头","节","罐","袋","捆",
  ]);
  if (colloidalUnits.has(stdUnit)) {
    const gramsPerUnit = (() => {
      const matched = matchIngredientHints(name).filter((h) => h.colloidalUnit === stdUnit);
      if (matched.length) return matched[0].gramsPerUnit;
      return fallbackGramsPerUnitFor(stdUnit, name);
    })();
    const qtyNum = Math.round(total); // 这些单位通常是整数个
    const countDisplay = Number.isInteger(total) ? String(qtyNum) : String(total);
    const approxColloidal = `约${countDisplay}${smartPluralize(stdUnit, qtyNum)}`;
    if (gramsPerUnit) {
      const grams = roundQuantity(total * gramsPerUnit);
      // —— 用户约定：无论原口径是否为通俗量词，都先把「标准克」写出来。
      //    反算出的克数仍带“约”，提醒这是估算值；通俗叫法放括号里提示。
      const gramsText = `${grams}克`;
      const approxGrams = `约${grams}克`;
      const combined = sourceNote
        ? `${gramsText}（${approxColloidal} · ${sourceNote}）`
        : `${gramsText}（${approxColloidal}）`;
      return { gramsText: approxGrams, colloidalText: approxColloidal, combined };
    }
    // 没匹配到，就保留 “3个” 的原写法，不做克换算。
    const base = `${countDisplay}${stdUnit}`;
    const combined = sourceNote ? `${base}（${sourceNote}）` : base;
    return { gramsText: "", colloidalText: approxColloidal, combined };
  }

  // —— Case 4: 其它通用单位 ——
  const base = `${total}${stdUnit}`;
  const combined = sourceNote ? `${base}（${sourceNote}）` : base;
  return { gramsText: base, colloidalText: sourceNote, combined };
}

function buildFromGrams(
  name: string,
  grams: number,
  sourceNote: string,
  origin: "g" | "kg"
): FormattedQuantity {
  const base = origin === "kg" ? `${grams}克` : `${grams}克`;
  const approxColloidal = colloidalFromGrams(name, grams);
  const marketWeight = marketWeightText(grams);
  const detailParts: string[] = [];
  if (approxColloidal) detailParts.push(approxColloidal);
  if (marketWeight && approxColloidal !== marketWeight) detailParts.push(marketWeight);
  if (sourceNote) detailParts.push(sourceNote);
  const combined = detailParts.length ? `${base}（${detailParts.join(" · ")}）` : base;
  return {
    gramsText: base,
    colloidalText: approxColloidal,
    combined,
  };
}

/** 1斤=500克，菜市场通用补充：>=250g 时给“X斤”提示。 */
function marketWeightText(grams: number): string {
  if (!grams || grams < 250) return "";
  // 整 500 克倍数：直接“1斤 / 2斤”
  if (grams % 500 === 0) return `${grams / 500}斤`;
  // 250/750/1250 这种：半斤 / 1.5斤 / ……
  const jin = grams / 500;
  const jinFixed = Math.round(jin * 10) / 10;
  return `约${jinFixed}斤`;
}

/**
 * 根据 hint 表把克数翻译成“约N个/N块/N根/N颗”。
 * 当同食材命中多条（比如鸡蛋 10g/颗 + 50g/个），优先展示最贴近用户约定的“颗粒级”量词，
 * 并最多返回 2 条，避免信息爆炸。
 */
export function colloidalFromGrams(name: string, grams: number): string {
  if (!grams || grams <= 0) return "";
  const matched = matchIngredientHints(name);
  if (!matched.length) return "";
  // 优先不同量词各取一个，避免重复
  const byUnit = new Map<string, IngredientUnitHint>();
  for (const h of matched) {
    if (!byUnit.has(h.colloidalUnit)) byUnit.set(h.colloidalUnit, h);
  }
  const results: string[] = [];
  // 同一 unit 按 gramsPerUnit 小的优先（颗粒级口径更贴近用户“100克约10颗鸡蛋”的习惯）
  for (const [unit, hint] of Array.from(byUnit.entries()).sort((a, b) => a[1].gramsPerUnit - b[1].gramsPerUnit)) {
    const rawCount = grams / hint.gramsPerUnit;
    if (!Number.isFinite(rawCount) || rawCount <= 0) continue;
    // 极小值（< 0.5）不再胡扯“约0.1块”，直接省略。
    if (rawCount < 0.5) continue;
    // 极大值也限制一下，避免“500克鸡蛋≈50颗”里极端值过夸张。
    if (rawCount > 500) continue;
    const count = roundQuantity(rawCount);
    const countStr =
      Number.isInteger(count) ? String(count) : count.toFixed(count < 10 ? 1 : 0).replace(/\.0$/, "");
    // 如果格式化后数字仍是 < 1，也不展示（避免约0.5这种让人抓头皮的描述）。
    if (parseFloat(countStr) < 1) continue;
    results.push(`约${countStr}${smartPluralize(unit, Number(countStr))}`);
    if (results.length >= 2) break;
  }
  return results.join(" / ");
}

/** 兼容旧版购物面板里的内联函数签名。 */
export function formatSmartQuantity(input: {
  name: string;
  totalQuantity: number | null;
  unit: string;
  sources?: Array<{ note?: string }>;
}): string {
  return formatShoppingQuantity(input).combined;
}
