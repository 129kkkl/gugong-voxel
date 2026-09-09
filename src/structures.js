import { C } from './palette.js';

/** 红色宫墙 + 黄琉璃瓦墙帽（帽石出檐一格，墙脚白石裙） */
export function wallRun(v, x0, x1, z0, z1, h, o = {}) {
  const body = o.body ?? C.wallBody;
  const coping = o.coping ?? C.copingTile;
  const over = o.overhang ?? 1;
  v.fill(x0, x1, 0, h - 1, z0, z1, body);
  if (o.skirt !== false) v.fill(x0, x1, 0, 0, z0, z1, C.marbleDark); // 石裙
  v.fill(x0 - over, x1 + over, h, h, z0 - over, z1 + over, coping);
}

/**
 * 汉白玉栏杆：望柱（每 3 格 1 根，2 高）+ 寻杖（连续 1 高）。
 * y 为栏杆底部所在层（即台面行走层）。skip(x,z) 可挖豁口。
 */
export function balustrade(v, x0, x1, z0, z1, y, color = C.marble, skip = null) {
  const onPerim = (x, z) => x === x0 || x === x1 || z === z0 || z === z1;
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      if (!onPerim(x, z)) continue;
      if (skip && skip(x, z)) continue;
      const post = ((x % 3) === 0 && (z % 3) === 0);
      if (post) {
        v.set(x, y, z, color);
        v.set(x, y + 1, z, color);
      } else {
        v.set(x, y + 1, z, color);
      }
    }
  }
}

/** 石阶（实心楔形）。axis='z'：沿 z 进深方向下降；axis='x'：沿 x 方向下降 */
export function stairFlight(v, a0, a1, start, dir, topY, color = C.marble, axis = 'z') {
  for (let s = 0; s < topY; s++) {
    const hh = topY - s;
    if (hh <= 0) break;
    const p = start + dir * s;
    if (axis === 'z') v.fill(a0, a1, 0, hh - 1, p, p, color);
    else v.fill(p, p, 0, hh - 1, a0, a1, color);
  }
}

/**
 * 格扇门窗面。axis='z'：位于 z=fixed 平面，a 为 x；
 * axis='x'：位于 x=fixed 平面，a 为 z。
 * 下部 40% 为实心裙板，上部为竖棂横枋格心。
 */
export function latticePlane(v, a0, a1, y0, y1, fixed, axis = 'z') {
  const skirtTop = y0 + Math.round((y1 - y0) * 0.42);
  for (let a = a0; a <= a1; a++) {
    for (let y = y0; y <= y1; y++) {
      let c;
      if (y <= skirtTop) {
        c = (y === skirtTop) ? C.columnRed : C.latticeDark;      // 裙板 + 上槛
      } else {
        const frame = (a % 3 === 0) || (y % 4 === 0) || y === y1;
        c = frame ? C.latticeDark : C.latticeLight;
      }
      if (axis === 'z') v.set(a, y, fixed, c);
      else v.set(fixed, y, a, c);
    }
  }
}

/**
 * 斗拱彩画带（檐下枋，绿蓝相间 + 柱头金点），并按 3 格间距
 * 向外再出挑一排金色"坐斗"，形成真斗拱出挑层次。
 */
export function dougongBand(v, x0, x1, z0, z1, y, colXs = []) {
  const goldSet = new Set();
  for (const cx of colXs) { goldSet.add(cx); goldSet.add(cx + 1); }
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      const onPerim = x === x0 || x === x1 || z === z0 || z === z1;
      if (!onPerim) continue;
      let c;
      if (goldSet.has(x)) c = C.gold;
      else c = (((x + z) >> 1) % 2 === 0) ? C.dougongGreen : C.dougongBlue;
      v.set(x, y, z, c);
    }
  }
  // 出挑坐斗（再外扩一圈，每 3 格一枚）
  for (let x = x0 - 1; x <= x1 + 1; x++) {
    for (let z = z0 - 1; z <= z1 + 1; z++) {
      const onOuter = x === x0 - 1 || x === x1 + 1 || z === z0 - 1 || z === z1 + 1;
      if (!onOuter) continue;
      if ((x + z) % 3 !== 0) continue;
      const corner = (x <= x0 || x >= x1) && (z <= z0 || z >= z1);
      if (corner) continue;
      v.set(x, y, z, C.gold);
    }
  }
}

/** 宫灯（金盖红灯身金穗） */
export function lantern(v, x, y, z) {
  v.set(x, y + 1, z, C.gold);
  v.set(x, y, z, C.lanternRed);
  v.set(x, y - 1, z, C.gold);
}

/** 石狮（须弥座 + 蹲坐意象块） */
export function lion(v, x, z, color = C.stoneLion, pedestal = C.marbleDark) {
  v.fill(x, x + 1, 0, 0, z, z + 1, pedestal);
  v.fill(x, x + 1, 1, 2, z, z + 1, color);
  v.fill(x, x + 1, 3, 3, z, z + 1, color);
  v.set(x, 1, z + 1, color);
}

/** 鎏金铜缸（石座 + 缸身 + 口沿） */
export function bronzeVat(v, x, z, y = 0) {
  v.fill(x, x + 1, y, y, z, z + 1, C.marbleDark);
  v.fill(x, x + 1, y + 1, y + 2, z, z + 1, C.bronzeGold);
  v.fill(x, x + 1, y + 3, y + 3, z, z + 1, C.bronze);
}

/** 铜龟 */
export function bronzeTurtle(v, x, z, y) {
  v.fill(x, x + 1, y, y, z, z + 1, C.bronze);          // 足
  v.fill(x, x + 1, y + 1, y + 1, z, z + 1, C.bronzeGold); // 甲
  v.set(x, y + 2, z, C.bronzeGold);                     // 甲顶
  v.set(x, y + 1, z + 2, C.bronze);                     // 头
}

/** 铜鹤（立鹤展颈意象） */
export function bronzeCrane(v, x, z, y) {
  v.set(x, y, z, C.bronze);                              // 足
  v.fill(x, x + 1, y + 1, y + 1, z, z, C.bronzeGold);    // 身
  v.set(x, y + 2, z, C.bronzeGold);                      // 颈根
  v.set(x, y + 3, z, C.bronzeGold);                      // 颈
  v.set(x, y + 4, z, C.bronze);                          // 首喙
}

/** 日晷 */
export function sundial(v, x, z, y) {
  v.fill(x, x, y, y + 2, z, z, C.marble);
  v.set(x, y + 3, z, C.marbleMid);
  v.set(x, y + 4, z, C.bronze);
}

/** 嘉量（鎏金量器） */
export function jialiang(v, x, z, y) {
  v.fill(x, x, y, y + 2, z, z, C.marble);
  v.fill(x, x, y + 3, y + 4, z, z, C.bronzeGold);
}

/** 斗匾（蓝底金边，悬于檐枋上方） */
export function plaque(v, cx, y, fixed, axis = 'z', w = 3, h = 2) {
  const x0 = cx - Math.floor(w / 2);
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      const border = i === 0 || i === w - 1 || j === 0 || j === h - 1;
      const c = border ? C.gold : C.plaqueBlue;
      const x = x0 + i;
      if (axis === 'z') v.set(x, y + j, fixed, c);
      else v.set(fixed, y + j, x, c);
    }
  }
}

/** 古柏（收分树冠） */
export function cypress(v, x, z, y = 0) {
  v.fill(x, x, y, y + 1, z, z, C.trunk);
  v.fill(x - 1, x + 1, y + 2, y + 3, z - 1, z + 1, C.leafA);
  v.fill(x - 1, x + 1, y + 3, y + 3, z - 1, z + 1, C.leafB);
  v.fill(x, x + 1, y + 4, y + 4, z, z, C.leafA);
  v.set(x, y + 5, z, C.leafB);
}

/** 古槐/松（宽冠两层） */
export function broadTree(v, x, z, y = 0) {
  v.fill(x, x, y, y + 2, z, z, C.trunk);
  v.fill(x - 2, x + 2, y + 3, y + 3, z - 2, z + 2, C.leafB);
  v.fill(x - 2, x + 2, y + 4, y + 4, z - 2, z + 2, C.leafA);
  v.fill(x - 1, x + 1, y + 5, y + 5, z - 1, z + 1, C.leafB);
  v.set(x, y + 6, z, C.leafA);
}

/** 拱形门洞：竖直开挖 + 顶部内收两行成拱 */
export function archedGate(v, x0, x1, yBase, h, z0, z1, axis = 'z') {
  if (axis === 'z') v.carve(x0, x1, yBase, yBase + h - 3, z0, z1);
  else v.carve(z0, z1, yBase, yBase + h - 3, x0, x1);
  for (let i = 1; i <= 2; i++) {
    const y = yBase + h - 3 + i;
    if (y > yBase + h - 1) break;
    const a0 = x0 + i, a1 = x1 - i;
    if (a1 < a0) break;
    if (axis === 'z') v.carve(a0, a1, y, y, z0, z1);
    else v.carve(z0, z1, y, y, a0, a1);
  }
}

/** 门扇（暗红门板 + 金钉）。fixed/axis 同 latticePlane */
export function doorPanel(v, a0, a1, y0, y1, fixed, axis = 'z') {
  for (let a = a0; a <= a1; a++) {
    for (let y = y0; y <= y1; y++) {
      const stud = (a % 3 === 1) && (y % 3 === 1);
      const c = stud ? C.doorNail : C.latticeDark;
      if (axis === 'z') v.set(a, y, fixed, c);
      else v.set(fixed, y, a, c);
    }
  }
}
