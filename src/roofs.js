import { C, shade } from './palette.js';

const lerp = (a, b, t) => a + (b - a) * t;

// 由中心 + 宽深（格数）得包含式矩形
function rectFrom(cx, cz, w, d) {
  const x0 = Math.round(cx - (w - 1) / 2);
  const z0 = Math.round(cz - (d - 1) / 2);
  return { x0, x1: x0 + w - 1, z0, z1: z0 + d - 1 };
}

function inside(r, x, z) {
  return x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;
}

/**
 * 瓦面色：按 x 列做明暗交替模拟筒瓦垄，带内微缩 8%。
 */
let tileShadeCache = new Map();
function tileColor(baseHex, x, banding) {
  if (!banding) return baseHex;
  let dark = tileShadeCache.get(baseHex);
  if (dark === undefined) {
    dark = shade(baseHex, 0.88);
    tileShadeCache.set(baseHex, dark);
  }
  return (x % 2 === 0) ? baseHex : dark;
}

/**
 * 垂脊：坡面四角阶梯棱线描深 + 间点金色脊兽。
 */
function hipRidges(v, r, y, levels, ridgeColor, beastColor) {
  const corners = [
    [r.x0, r.z0, 1, 1], [r.x1, r.z0, -1, 1],
    [r.x0, r.z1, 1, -1], [r.x1, r.z1, -1, -1]
  ];
  for (const [cx, cz, dx, dz] of corners) {
    for (let i = 0; i < levels; i++) {
      const x = cx + dx * i, z = cz + dz * i;
      v.set(x, y + i, z, ridgeColor);
      // 脊兽：沿垂脊隔层点缀金点
      if (i >= 2 && i % 2 === 0) v.set(x + dx, y + i, z, beastColor);
    }
  }
}

/**
 * 发射一层屋顶带：outer 矩形中，不属于 inner 收缩一圈的部分。
 * 保留 inner 边界一圈以封住檐口下的缝隙。
 */
function emitBand(v, outer, inner, y, colorFn, hole = null) {
  for (let x = outer.x0; x <= outer.x1; x++) {
    for (let z = outer.z0; z <= outer.z1; z++) {
      if (inner &&
          x >= inner.x0 + 1 && x <= inner.x1 - 1 &&
          z >= inner.z0 + 1 && z <= inner.z1 - 1) continue;
      if (hole && inside(hole, x, z)) continue;
      v.set(x, y, z, colorFn(x, z));
    }
  }
}

function emitRect(v, r, y, colorFn, hole = null) {
  for (let x = r.x0; x <= r.x1; x++)
    for (let z = r.z0; z <= r.z1; z++) {
      if (hole && inside(hole, x, z)) continue;
      v.set(x, y, z, colorFn(x, z));
    }
}

/** 檐角翘起：角部向外伸出并抬升两格 */
export function upturnCorners(v, r, y, color) {
  const corners = [
    [r.x0 - 1, r.z0 - 1], [r.x1 + 1, r.z0 - 1],
    [r.x0 - 1, r.z1 + 1], [r.x1 + 1, r.z1 + 1]
  ];
  for (const [cx, cz] of corners) {
    v.set(cx, y, cz, color);
    v.set(cx, y + 1, cz, color);
  }
}

/**
 * 庑殿顶（四坡顶，正脊平行于 X 轴）。
 * o: { cx, cz, w, d, y, h, ridge, field, edge, topColor, hole, upturn, tipColor, banding, hipRidge }
 */
export function hipRoof(v, o) {
  const {
    cx, cz, w, d, y, h,
    ridge = 2,
    field = C.tileYellow,
    edge = C.tileYellowLight,
    topColor = C.tileYellowDark,
    hole = null,
    upturn = true,
    tipColor = C.tileYellowLight,
    banding = true,
    hipRidge = true
  } = o;

  const rects = [];
  for (let i = 0; i < h; i++) {
    const t = h === 1 ? 1 : i / (h - 1);
    const wi = Math.max(2, Math.round(lerp(w, ridge, t)));
    const di = Math.max(2, Math.round(lerp(d, 2, t)));
    rects.push(rectFrom(cx, cz, wi, di));
  }
  for (let i = 0; i < h; i++) {
    const base = i === 0 ? edge : (i === h - 1 ? topColor : field);
    const colorFn = (x) => tileColor(base, x, banding && i > 0);
    if (i === h - 1) emitRect(v, rects[i], y + i, colorFn, hole);
    else emitBand(v, rects[i], rects[i + 1], y + i, colorFn, hole);
  }
  if (hipRidge && h >= 3) {
    hipRidges(v, rects[0], y + 1, Math.min(h - 1, 4), C.ridgeDark, C.gold);
  }
  if (upturn && h >= 2) upturnCorners(v, rects[0], y, tipColor);
  return rects;
}

/**
 * 歇山顶（下部四坡 + 上部垂直山花）。
 */
export function gableHipRoof(v, o) {
  const {
    cx, cz, w, d, y, h,
    ridgeW = Math.round(w * 0.4),
    gableH = Math.max(2, Math.round(h * 0.35)),
    field = C.tileYellow,
    edge = C.tileYellowLight,
    gable = C.greenGlaze,
    trim = C.gold,
    topColor = C.tileYellowDark,
    upturn = true,
    tipColor = C.tileYellowLight,
    banding = true,
    hipRidge = true
  } = o;

  const rects = [];
  const lowerH = h - gableH;
  for (let i = 0; i < h; i++) {
    const td = h === 1 ? 1 : i / (h - 1);
    const di = Math.max(2, Math.round(lerp(d, 2, td)));
    let wi;
    if (i < lowerH) {
      const tw = lowerH === 1 ? 1 : i / (lowerH - 1);
      wi = Math.max(ridgeW, Math.round(lerp(w, ridgeW, tw)));
    } else {
      wi = ridgeW;
    }
    rects.push(rectFrom(cx, cz, wi, di));
  }

  for (let i = 0; i < h; i++) {
    const r = rects[i];
    const isGable = i >= lowerH;
    const base = i === 0 ? edge : (i === h - 1 ? topColor : field);
    const emitCell = (x, z) => {
      let c = tileColor(base, x, banding && i > 0);
      if (isGable && (x === r.x0 || x === r.x1)) {
        c = (i === lowerH) ? trim : gable;   // 山花 + 金色博脊端
      }
      v.set(x, y + i, z, c);
    };
    if (i === h - 1) {
      for (let x = r.x0; x <= r.x1; x++) for (let z = r.z0; z <= r.z1; z++) emitCell(x, z);
    } else {
      const inner = rects[i + 1];
      for (let x = r.x0; x <= r.x1; x++) {
        for (let z = r.z0; z <= r.z1; z++) {
          if (x >= inner.x0 + 1 && x <= inner.x1 - 1 &&
              z >= inner.z0 + 1 && z <= inner.z1 - 1) continue;
          emitCell(x, z);
        }
      }
    }
  }
  if (hipRidge && h >= 4) {
    hipRidges(v, rects[0], y + 1, Math.min(lowerH - 1, 3), C.ridgeDark, C.gold);
  }
  if (upturn && h >= 2) upturnCorners(v, rects[0], y, tipColor);
  return rects;
}

/** 四角攒尖顶（向中心收拢的方锥） */
export function pyramidRoof(v, o) {
  const {
    cx, cz, w, d, y, h,
    field = C.tileYellow,
    edge = C.tileYellowLight,
    topColor = C.tileYellowDark,
    banding = true,
    hipRidge = true
  } = o;
  const rects = [];
  for (let i = 0; i < h; i++) {
    const t = h === 1 ? 1 : i / (h - 1);
    const wi = Math.max(2, Math.round(lerp(w, 2, t)));
    const di = Math.max(2, Math.round(lerp(d, 2, t)));
    rects.push(rectFrom(cx, cz, wi, di));
  }
  for (let i = 0; i < h; i++) {
    const base = i === 0 ? edge : (i === h - 1 ? topColor : field);
    const colorFn = (x) => tileColor(base, x, banding && i > 0);
    if (i === h - 1) emitRect(v, rects[i], y + i, colorFn);
    else emitBand(v, rects[i], rects[i + 1], y + i, colorFn);
  }
  if (hipRidge && h >= 4) {
    hipRidges(v, rects[0], y + 1, Math.min(h - 2, 4), C.ridgeDark, C.gold);
  }
  return rects;
}

/** 十字脊（两座庑殿正交，用于角楼） */
export function crossRoof(v, o) {
  hipRoof(v, { ...o, ridge: Math.max(4, Math.round(o.w * 0.5)) });
  hipRoof(v, { ...o, w: o.d, d: o.w, ridge: Math.max(4, Math.round(o.d * 0.5)) });
}

/** 正脊 + 鸱吻（金色吻兽收头） */
export function ridgeDeco(v, { y, x0, x1, z, z1 = null, color = C.ridgeDark, endColor = C.gold, endH = 2 }) {
  const za = z, zb = (z1 === null ? z : z1);
  for (let x = x0; x <= x1; x++)
    for (let z2 = za; z2 <= zb; z2++)
      v.set(x, y, z2, color);
  v.set(x0 - 1, y, za, endColor); v.set(x0 - 1, y + 1, za, endColor);
  v.set(x1 + 1, y, za, endColor); v.set(x1 + 1, y + 1, za, endColor);
  if (zb !== za) {
    v.set(x0 - 1, y, zb, endColor); v.set(x0 - 1, y + 1, zb, endColor);
    v.set(x1 + 1, y, zb, endColor); v.set(x1 + 1, y + 1, zb, endColor);
  }
}

/** 攒尖顶鎏金宝顶 */
export function finial(v, { x, z, y }) {
  v.fill(x, x + 1, y, y, z, z + 1, C.goldBright);
  v.set(x, y + 1, z, C.goldBright);
  v.set(x, y + 2, z, C.gold);
}
