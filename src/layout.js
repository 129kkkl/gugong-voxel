import { C } from './palette.js';
import { hipRoof, gableHipRoof, pyramidRoof, crossRoof, ridgeDeco, finial } from './roofs.js';
import {
  wallRun, balustrade, stairFlight, latticePlane, dougongBand,
  lantern, lion, bronzeVat, sundial, jialiang, archedGate, doorPanel,
  plaque, cypress, broadTree, bronzeTurtle, bronzeCrane
} from './structures.js';

// ============================================================
// 全局坐标（+Z = 南 / 午门方向，-Z = 北；X = 东西，中轴 x=0）
// ============================================================
export const LABELS = [];

function tag(name, x, y, z) { LABELS.push({ name, x, y, z }); }

// ------------------------------------------------------------
// 宫墙 + 四隅角楼
// ------------------------------------------------------------
function cornerTower(v, cx, cz) {
  // 城台上的汉白玉平台
  v.fill(cx - 8, cx + 7, 7, 9, cz - 8, cz + 7, C.marble);
  // 塔身（白色束腰 + 红身）
  v.fill(cx - 4, cx + 3, 10, 10, cz - 4, cz + 3, C.marbleMid);
  v.fill(cx - 4, cx + 3, 11, 15, cz - 4, cz + 3, C.wallRed);
  // 下檐
  hipRoof(v, { cx, cz, w: 14, d: 14, y: 16, h: 3, ridge: 6 });
  // 中身
  v.fill(cx - 3, cx + 2, 19, 20, cz - 3, cz + 2, C.wallRed);
  // 十字脊顶
  crossRoof(v, { cx, cz, w: 10, d: 10, y: 21, h: 5, ridge: 5 });
  // 鎏金宝顶
  v.fill(cx - 1, cx, 26, 26, cz - 1, cz, C.goldBright);
  v.set(cx - 1, 27, cz - 1, C.gold);
}

function buildWalls(v) {
  // 四面宫墙（h6）+ 瓦帽（北侧外扩至内朝区域）
  wallRun(v, -135, -134, -214, 93, 6);            // 西
  wallRun(v, 134, 135, -214, 93, 6);              // 东
  // 分界墙（乾清门处留豁）与北外墙（神武门处留豁）
  wallRun(v, -135, -17, -135, -134, 6);   // 前朝/后寝分界墙（西段）
  wallRun(v, 16, 135, -135, -134, 6);     // 分界墙（东段）
  wallRun(v, -135, -21, -214, -213, 6);   // 北外墙（西段）
  wallRun(v, 20, 135, -214, -213, 6);     // 北外墙（东段）
  wallRun(v, -135, 135, 92, 93, 6);               // 南（午门后身，多被城台覆盖）
  // 午门双翼（南墙加高段 h10）
  wallRun(v, 36, 135, 92, 93, 10);
  wallRun(v, -135, -36, 92, 93, 10);
  // 四隅角楼（西北/东北随外墙北移）
  cornerTower(v, -134.5, -213.5);
  cornerTower(v, 134.5, -213.5);
  cornerTower(v, -134.5, 92.5);
  cornerTower(v, 134.5, 92.5);
  tag('角楼', -135, 33, -213);
  tag('角楼', 135, 33, 92);
}

// ------------------------------------------------------------
// 午门（凹字形城台 + 城楼）
// ------------------------------------------------------------
function buildWuGate(v) {
  // 汉白玉城台基座
  v.fill(-46, 45, 0, 1, 64, 95, C.marble);
  v.ring(-46, 45, 64, 95, 1, C.marbleMid);
  // 城台主体
  v.fill(-36, 35, 2, 12, 66, 93, C.wallRed);
  // 三个门洞（中高侧低，拱顶收分）
  archedGate(v, -3, 3, 2, 9, 66, 93);
  archedGate(v, -16, -12, 2, 7, 66, 93);
  archedGate(v, 12, 16, 2, 7, 66, 93);
  // 门扇（前后两面）
  doorPanel(v, -3, 3, 2, 8, 93);  doorPanel(v, -3, 3, 2, 8, 66);
  doorPanel(v, -16, -12, 2, 6, 93); doorPanel(v, -16, -12, 2, 6, 66);
  doorPanel(v, 12, 16, 2, 6, 93);  doorPanel(v, 12, 16, 2, 6, 66);
  // 城台顶面 +雉堞栏杆
  v.fill(-36, 35, 13, 13, 66, 93, C.marbleMid);
  balustrade(v, -36, 35, 66, 93, 14);
  // 城楼
  v.fill(-12, 11, 14, 14, 71, 86, C.marbleMid);
  v.fill(-12, 11, 15, 19, 71, 86, C.wallRed);
  // 重檐：下檐（环）
  hipRoof(v, {
    cx: -0.5, cz: 78.5, w: 30, d: 22, y: 20, h: 3, ridge: 4,
    hole: { x0: -10, x1: 9, z0: 73, z1: 84 }
  });
  // 上层环廊
  for (let y = 20; y <= 23; y++) v.ring(-10, 9, 73, 84, y, C.wallRed);
  latticePlane(v, -9, 8, 21, 22, 73); latticePlane(v, -9, 8, 21, 22, 84);
  dougongBand(v, -11, 10, 72, 85, 24, []);
  // 上檐
  hipRoof(v, { cx: -0.5, cz: 78.5, w: 26, d: 16, y: 25, h: 6, ridge: 8 });
  ridgeDeco(v, { y: 31, x0: -4, x1: 3, z: 78, z1: 79 });
  // 两翼阙楼（内拐角）
  for (const sx of [-1, 1]) {
    const xa = sx > 0 ? 38 : -45, xb = sx > 0 ? 45 : -38;
    v.fill(xa, xb, 2, 9, 88, 95, C.wallRed);
    v.fill(xa, xb, 10, 10, 88, 95, C.marbleMid);
    hipRoof(v, { cx: sx * 41.5, cz: 91.5, w: 12, d: 12, y: 11, h: 3, ridge: 4 });
  }
  // 甬道宫灯 + 门匾
  lantern(v, -5, 12, 80); lantern(v, 5, 12, 80);
  plaque(v, 0, 11, 94);
  tag('午门', -14, 36, 80);
}

// ------------------------------------------------------------
// 内金水河 + 五座石桥
// ------------------------------------------------------------
const BRIDGES = [
  { cx: 0, hw: 4 }, { cx: -14, hw: 3 }, { cx: 14, hw: 3 },
  { cx: -60, hw: 3 }, { cx: 60, hw: 3 }
];

function buildCanal(v) {
  // 河岸石护栏（留出桥口）
  const nearBridge = (x) => BRIDGES.some(b => Math.abs(x - b.cx) <= b.hw + 1);
  for (let x = -133; x <= 133; x++) {
    if (!nearBridge(x)) {
      v.set(x, 0, 43, C.marble);
      v.set(x, 0, 53, C.marble);
    }
  }
  // 石桥（拱身 + 桥面 + 望柱）
  for (const b of BRIDGES) {
    for (let z = 41; z <= 55; z++) {
      const t = (z - 41) / 14;
      const arc = Math.round(2.4 * Math.sin(Math.PI * t));
      const deckY = 1 + arc;
      v.fill(b.cx - b.hw, b.cx + b.hw, deckY, deckY, z, z, C.marble);
      // 拱侧墙（实心到水面）
      v.fill(b.cx - b.hw, b.cx - b.hw, 0, deckY - 1, z, z, C.marbleMid);
      v.fill(b.cx + b.hw, b.cx + b.hw, 0, deckY - 1, z, z, C.marbleMid);
      // 栏板 + 望柱
      v.set(b.cx - b.hw, deckY + 1, z, C.marble);
      v.set(b.cx + b.hw, deckY + 1, z, C.marble);
      if (z % 3 === 0) {
        v.set(b.cx - b.hw, deckY + 2, z, C.marble);
        v.set(b.cx + b.hw, deckY + 2, z, C.marble);
      }
    }
  }
  tag('金水桥', 0, 10, 48);
}

// ------------------------------------------------------------
// 太和门 + 两侧掖门 + 廊庑
// ------------------------------------------------------------
function buildTaiheGate(v) {
  // 汉白玉台基
  v.fill(-26, 25, 0, 0, 24, 40, C.marble);
  // 门身
  v.fill(-23, 22, 1, 9, 26, 38, C.wallRed);
  archedGate(v, -3, 3, 1, 8, 26, 38);
  archedGate(v, 11, 14, 1, 6, 26, 38);
  archedGate(v, -14, -11, 1, 6, 26, 38);
  doorPanel(v, -3, 3, 1, 6, 38);  doorPanel(v, -3, 3, 1, 6, 26);
  doorPanel(v, 11, 14, 1, 4, 38); doorPanel(v, 11, 14, 1, 4, 26);
  doorPanel(v, -14, -11, 1, 4, 38); doorPanel(v, -14, -11, 1, 4, 26);
  // 斗拱 + 单檐庑殿顶
  dougongBand(v, -25, 24, 24, 40, 10, []);
  hipRoof(v, { cx: -0.5, cz: 32, w: 52, d: 20, y: 11, h: 5, ridge: 6 });
  ridgeDeco(v, { y: 16, x0: -3, x1: 2, z: 32 });
  // 檐下宫灯
  for (const lx of [-16, -6, 6, 16]) lantern(v, lx, 10, 42);
  tag('太和门', 0, 22, 32);

  // 贞度门 / 昭德门
  for (const sx of [-1, 1]) {
    const xa = sx > 0 ? 28 : -37, xb = sx > 0 ? 37 : -28;
    v.fill(xa, xb, 0, 0, 26, 38, C.marble);
    v.fill(xa, xb, 1, 7, 26, 38, C.wallRed);
    archedGate(v, sx > 0 ? 31 : -34, sx > 0 ? 34 : -31, 1, 5, 26, 38);
    doorPanel(v, sx > 0 ? 31 : -34, sx > 0 ? 34 : -31, 1, 4, 38);
    hipRoof(v, { cx: sx * 32.5, cz: 32, w: 14, d: 16, y: 8, h: 3, ridge: 4 });
    // 与廊庑相连的矮墙
    wallRun(v, sx > 0 ? 38 : -59, sx > 0 ? 59 : -38, 31, 32, 5);
  }
  // 东西廊庑（跨金水河处留涵口）
  wallRun(v, 59, 60, 38, 40, 5);  wallRun(v, 59, 60, 56, 66, 5);
  wallRun(v, -60, -59, 38, 40, 5); wallRun(v, -60, -59, 56, 66, 5);
  // 门匾
  plaque(v, 0, 8, 39);

  // ---- 太和殿广场围墙 + 协和门 / 熙和门 ----
  wallRun(v, 60, 61, -20, -4, 5); wallRun(v, 60, 61, 10, 32, 5);
  wallRun(v, -61, -60, -20, -4, 5); wallRun(v, -61, -60, 10, 32, 5);
  for (const sx of [-1, 1]) {
    const xa = sx > 0 ? 57 : -69, xb = sx > 0 ? 69 : -57;
    v.fill(xa, xb, 0, 0, -2, 8, C.marble);
    v.fill(xa, xb, 1, 6, -2, 8, C.wallRed);
    if (sx > 0) archedGate(v, 58, 68, 1, 4, -2, 8, 'x');
    else archedGate(v, -68, -58, 1, 4, -2, 8, 'x');
    hipRoof(v, { cx: sx * 63.5, cz: 3, w: 17, d: 13, y: 7, h: 3, ridge: 5 });
  }
  // 广场围墙与文华/武英殿院墙的连接短墙
  wallRun(v, 62, 74, -12, -11, 4);
  wallRun(v, -74, -62, -12, -11, 4);

  // ---- 体仁阁 / 弘义阁（广场东西二层楼阁） ----
  for (const sx of [-1, 1]) {
    const xa = sx > 0 ? 58 : -79, xb = sx > 0 ? 79 : -58;
    v.fill(xa, xb, 0, 0, -47, -30, C.marble);
    v.fill(xa + 2, xb - 2, 1, 7, -45, -32, C.wallRed);       // 下层
    v.fill(xa + 2, xb - 2, 7, 7, -45, -32, C.columnRed);     // 上层腰檐枋
    dougongBand(v, xa + 1, xb - 1, -46, -31, 8, []);
    hipRoof(v, {
      cx: sx * 68.5, cz: -38.5, w: 27, d: 19, y: 9, h: 3, ridge: 8,
      hole: { x0: sx > 0 ? 62 : -77, x1: sx > 0 ? 75 : -62, z0: -42, z1: -35 }
    });
    v.fill(xa + 4, xb - 4, 9, 13, -43, -34, C.wallRed);      // 上层
    latticePlane(v, sx > 0 ? 63 : -74, sx > 0 ? 74 : -63, 10, 12, -43);
    dougongBand(v, xa + 3, xb - 3, -44, -33, 14, []);
    gableHipRoof(v, { cx: sx * 68.5, cz: -38.5, w: 25, d: 15, y: 15, h: 5, ridgeW: 8, gableH: 2 });
  }

  // ---- 午门庭院东、西朝房连廊（灰瓦） ----
  for (const sx of [-1, 1]) {
    for (const [za, zb] of [[58, 72], [74, 88]]) {
      const xa = sx > 0 ? 66 : -130, xb = sx > 0 ? 130 : -66;
      v.fill(xa, xb, 0, 4, za, zb, C.wallBody);
      v.fill(xa, xb, 0, 0, za, zb, C.marbleDark);
      hipRoof(v, {
        cx: sx * 98.5, cz: (za + zb) / 2, w: 70, d: zb - za + 4, y: 5, h: 3,
        ridge: Math.max(4, zb - za - 8), banding: true, hipRidge: false,
        field: C.slateRoof, edge: 0x68727c, topColor: 0x43494f, tipColor: 0x68727c
      });
    }
  }
}

// ------------------------------------------------------------
// 三大殿"工"字形三层汉白玉台基
// ------------------------------------------------------------
const TERRACE = {
  L1: {
    y: 0, h: 3,
    rects: [
      [-52, 52, -64, -20],   // 南（太和殿）
      [-22, 22, -88, -63],   // 中颈（中和殿）
      [-52, 52, -116, -87]   // 北（保和殿）
    ]
  },
  L2: {
    y: 3, h: 2,
    rects: [
      [-50, 50, -62, -22],
      [-20, 20, -88, -63],
      [-50, 50, -114, -89]
    ]
  },
  L3: {
    y: 5, h: 2,
    rects: [
      [-48, 48, -60, -24],
      [-18, 18, -84, -67],
      [-48, 48, -112, -91]
    ]
  }
};

function terraceLayer(v, layer, coverRects, sideColor, topColor) {
  const { y, h, rects } = layer;
  for (const [x0, x1, z0, z1] of rects) {
    // 侧裙（每层底脚一圈深色圭角）
    for (let yy = y; yy < y + h; yy++) {
      v.ring(x0, x1, z0, z1, yy, yy === y ? C.marbleDark : sideColor);
    }
    // 顶面：跳过被上层覆盖的内部
    const top = y + h - 1;
    for (let x = x0; x <= x1; x++) {
      for (let z = z0; z <= z1; z++) {
        let covered = false;
        for (const [cx0, cx1, cz0, cz1] of coverRects) {
          if (x > cx0 && x < cx1 && z > cz0 && z < cz1) { covered = true; break; }
        }
        if (!covered) v.set(x, top, z, topColor);
      }
    }
  }
}

function buildTerrace(v) {
  terraceLayer(v, TERRACE.L1, TERRACE.L2.rects, C.marbleMid, C.marbleMid);
  terraceLayer(v, TERRACE.L2, TERRACE.L3.rects, C.marble, C.marble);
  terraceLayer(v, TERRACE.L3, [], C.marble, C.marble);

  // ---- 台阶 ----
  // 南面御路大阶（丹陛石居中，两侧踏跺）
  for (let s = 0; s <= 6; s++) {
    const z = -24 + s, hh = 7 - s;
    if (hh <= 0) break;
    v.fill(-6, 6, 0, hh - 1, z, z, C.marble);
    v.fill(-3, 3, hh - 1, hh - 1, z, z, C.rampStone);   // 丹陛石
    v.set(0, hh - 1, z, C.gold);                        // 云龙金线
    for (const bx of [-7, 7]) {                         // 石栏杆栏板
      v.fill(bx, bx, 0, hh, z, z, C.marble);
      if (s % 3 === 0) v.set(bx, hh + 1, z, C.marble);
    }
  }
  // 北面台阶（保和殿后）
  for (let s = 0; s <= 5; s++) {
    const z = -113 - s, hh = 6 - s;
    if (hh <= 0) break;
    v.fill(-4, 4, 0, hh - 1, z, z, C.marble);
    for (const bx of [-5, 5]) v.fill(bx, bx, 0, hh, z, z, C.marble);
  }
  // 东西两面台阶
  for (const sx of [1, -1]) {
    for (let s = 0; s <= 6; s++) {
      const x = sx > 0 ? 49 + s : -49 - s, hh = 7 - s;
      if (hh <= 0) break;
      v.fill(x, x, 0, hh - 1, -47, -37, C.marble);
      for (const bz of [-48, -36]) v.fill(x, x, 0, hh, bz, bz, C.marble);
    }
  }

  // ---- 汉白玉栏杆 ----
  const stairGap = (edgeZ, lo, hi) => (x, z) => z === edgeZ && x >= lo && x <= hi;
  const sideGap = (edgeX) => (x, z) => x === edgeX && z >= -48 && z <= -36;
  balustrade(v, -48, 48, -60, -24, 7, C.marble, (x, z) =>
    (z === -24 && x >= -7 && x <= 7) || ((x === 48 || x === -48) && z >= -48 && z <= -36));
  balustrade(v, -18, 18, -88, -67, 7);
  balustrade(v, -48, 48, -112, -91, 7, C.marble, (x, z) => z === -112 && x >= -5 && x <= 5);
  balustrade(v, -50, 50, -62, -22, 5, C.marble, (x, z) =>
    (z === -22 && x >= -7 && x <= 7) || ((x === 50 || x === -50) && z >= -48 && z <= -36));
  balustrade(v, -20, 20, -88, -65, 5);
  balustrade(v, -50, 50, -114, -89, 5, C.marble, (x, z) => z === -114 && x >= -5 && x <= 5);
  balustrade(v, -52, 52, -64, -20, 3, C.marble, (x, z) =>
    (z === -20 && x >= -7 && x <= 7) || ((x === 52 || x === -52) && z >= -48 && z <= -36));
  balustrade(v, -22, 22, -88, -63, 3);
  balustrade(v, -52, 52, -116, -87, 3, C.marble, (x, z) => z === -116 && x >= -5 && x <= 5);

  // ---- 台基上的门座：中左门 / 中右门（太和殿东西）、后左门 / 后右门（北面） ----
  const terraceGate = (cx, cz) => {
    v.fill(cx - 5, cx + 4, 7, 7, cz - 2, cz + 1, C.marble);
    v.fill(cx - 5, cx + 4, 8, 11, cz - 2, cz + 1, C.wallRed);
    archedGate(v, cx - 2, cx + 1, 8, 3, cz - 2, cz + 1, 'x');
    dougongBand(v, cx - 6, cx + 5, cz - 3, cz + 2, 12, []);
    hipRoof(v, { cx: cx - 0.5, cz: cz - 0.5, w: 14, d: 9, y: 13, h: 3, ridge: 4 });
  };
  terraceGate(41, -57); terraceGate(-40, -57);   // 中左门 / 中右门
  terraceGate(30, -91); terraceGate(-29, -91);   // 后左门 / 后右门

  // ---- 台基边缘螭首（排水兽首，南、北两面） ----
  const spout = (x, z, y) => v.set(x, y, z, C.marble);
  for (let x = -46; x <= 46; x += 7) {
    spout(x, -23, 6); spout(x, -21, 4); spout(x, -19, 2);   // 南面三层
    spout(x, -111, 6); spout(x, -113, 4); spout(x, -115, 2); // 北面三层
  }
}

// ------------------------------------------------------------
// 太和殿（重檐庑殿顶，面阔十一间）
// ------------------------------------------------------------
function buildTaiheHall(v) {
  // 殿基
  v.fill(-36, 35, 7, 8, -60, -25, C.marble);
  v.ring(-36, 35, -60, -25, 7, C.marbleDark);

  // 柱网（面阔 11 间 + 进深）
  const xs = [-33, -27, -21, -15, -9, -3, 3, 9, 15, 21, 27, 31];
  const sideZ = [-51, -45, -39, -33];
  for (const x of xs) {
    v.fill(x, x + 1, 9, 19, -28, -27, C.columnRed);   // 前檐柱
    v.fill(x, x + 1, 9, 19, -57, -56, C.columnRed);   // 后檐柱
  }
  for (const z of sideZ) {
    v.fill(-33, -32, 9, 19, z, z + 1, C.columnRed);
    v.fill(31, 32, 9, 19, z, z + 1, C.columnRed);
  }
  // 前后格扇门（缩进一格，柱子外凸）
  for (let k = 0; k < xs.length - 1; k++) {
    const a0 = xs[k] + 2, a1 = xs[k + 1] - 1;
    if (a1 >= a0) {
      latticePlane(v, a0, a1, 9, 19, -27);
      latticePlane(v, a0, a1, 9, 19, -56);
    }
  }
  // 两山墙 + 格窗
  v.fill(-33, -33, 9, 19, -55, -29, C.wallRed);
  v.fill(32, 32, 9, 19, -55, -29, C.wallRed);
  latticePlane(v, -52, -48, 11, 17, -33, 'x');
  latticePlane(v, -52, -48, 11, 17, 32, 'x');
  // 额枋 + 斗拱
  v.ring(-33, 32, -57, -28, 20, C.columnRed);
  dougongBand(v, -34, 33, -58, -27, 21, xs);

  // 下檐（重檐第一檐，环形）
  hipRoof(v, {
    cx: -0.5, cz: -42.5, w: 74, d: 38, y: 22, h: 5, ridge: 12,
    hole: { x0: -25, x1: 24, z0: -53, z1: -32 }
  });
  // 上层殿身
  for (let y = 22; y <= 27; y++) v.ring(-25, 24, -53, -32, y, C.wallRed);
  latticePlane(v, -24, 23, 23, 26, -53);
  latticePlane(v, -24, 23, 23, 26, -32);
  dougongBand(v, -26, 25, -54, -31, 28, [-24, -12, 0, 12, 23]);
  // 上檐庑殿顶
  hipRoof(v, { cx: -0.5, cz: -42.5, w: 58, d: 24, y: 29, h: 9, ridge: 12 });
  ridgeDeco(v, { y: 38, x0: -6, x1: 5, z: -43, z1: -42 });
  // 斗匾 + 月台铜龟 / 铜鹤
  plaque(v, 0, 20, -26);
  bronzeTurtle(v, 22, -26, 7); bronzeCrane(v, -22, -26, 7);
  tag('太和殿', 0, 46, -42);
}

// ------------------------------------------------------------
// 中和殿（单檐四角攒尖顶）
// ------------------------------------------------------------
function buildZhongheHall(v) {
  v.fill(-9, 8, 7, 7, -85, -66, C.marble);
  // 柱身墙
  v.ring(-6, 5, -83, -72, 8, C.columnRed, 1);
  for (let y = 9; y <= 14; y++) v.ring(-6, 5, -83, -72, y, C.columnRed);
  // 柱
  for (const x of [-6, -1, 4]) {
    v.fill(x, x + 1, 8, 15, -72, -71, C.columnRed);
    v.fill(x, x + 1, 8, 15, -83, -82, C.columnRed);
  }
  v.fill(-6, -5, 8, 15, -78, -77, C.columnRed);
  v.fill(4, 5, 8, 15, -78, -77, C.columnRed);
  // 四面格扇
  latticePlane(v, -4, 3, 9, 14, -71);
  latticePlane(v, -4, 3, 9, 14, -82);
  latticePlane(v, -81, -73, 9, 14, -5, 'x');
  latticePlane(v, -81, -73, 9, 14, 4, 'x');
  // 额枋 + 斗拱
  v.ring(-6, 5, -83, -72, 15, C.columnRed);
  v.ring(-6, 5, -83, -72, 16, C.columnRed);
  dougongBand(v, -7, 6, -84, -71, 17, []);
  // 攒尖顶 + 鎏金宝顶
  pyramidRoof(v, { cx: -0.5, cz: -77.5, w: 22, d: 22, y: 18, h: 8 });
  finial(v, { x: -1, z: -78, y: 26 });
  tag('中和殿', 0, 33, -76);
}

// ------------------------------------------------------------
// 保和殿（重檐歇山顶，面阔九间）
// ------------------------------------------------------------
function buildBaoheHall(v) {
  v.fill(-28, 27, 7, 8, -112, -90, C.marble);
  v.ring(-28, 27, -112, -90, 7, C.marbleDark);

  const xs = [-24, -19, -14, -9, -4, 1, 6, 11, 16, 21];
  const sideZ = [-104, -98];
  for (const x of xs) {
    v.fill(x, x + 1, 9, 19, -93, -92, C.columnRed);
    v.fill(x, x + 1, 9, 19, -110, -109, C.columnRed);
  }
  for (const z of sideZ) {
    v.fill(-25, -24, 9, 19, z, z + 1, C.columnRed);
    v.fill(23, 24, 9, 19, z, z + 1, C.columnRed);
  }
  for (let k = 0; k < xs.length - 1; k++) {
    const a0 = xs[k] + 2, a1 = xs[k + 1] - 1;
    if (a1 >= a0) {
      latticePlane(v, a0, a1, 9, 19, -92);
      latticePlane(v, a0, a1, 9, 19, -109);
    }
  }
  v.fill(-25, -25, 9, 19, -108, -94, C.wallRed);
  v.fill(24, 24, 9, 19, -108, -94, C.wallRed);
  latticePlane(v, -103, -99, 11, 17, -25, 'x');
  latticePlane(v, -103, -99, 11, 17, 24, 'x');
  v.ring(-25, 24, -110, -93, 20, C.columnRed);
  dougongBand(v, -26, 25, -111, -92, 21, xs);

  // 下檐（环）
  hipRoof(v, {
    cx: -0.5, cz: -101.5, w: 58, d: 26, y: 22, h: 4, ridge: 8,
    hole: { x0: -19, x1: 18, z0: -109, z1: -94 }
  });
  // 上层殿身
  for (let y = 22; y <= 26; y++) v.ring(-19, 18, -109, -94, y, C.wallRed);
  latticePlane(v, -18, 17, 23, 25, -109);
  latticePlane(v, -18, 17, 23, 25, -94);
  dougongBand(v, -20, 19, -110, -93, 27, [-18, -6, 6, 17]);
  // 上檐歇山（绿色山花）
  gableHipRoof(v, { cx: -0.5, cz: -101.5, w: 46, d: 24, y: 28, h: 8, ridgeW: 14, gableH: 3 });
  ridgeDeco(v, { y: 36, x0: -7, x1: 6, z: -102, z1: -101 });
  tag('保和殿', 0, 43, -101);
}

// ------------------------------------------------------------
// 文华殿 / 武英殿（对称配殿，单檐歇山）
// ------------------------------------------------------------
function buildSideHall(v, sx, greenEdge) {
  // 镜像映射：sx=1 东（文华），sx=-1 西（武英）
  const X = (x) => (sx > 0 ? x : -1 - x);
  const XR = (a, b) => [X(a), X(b)];

  // 组院墙 + 门
  let [a, b] = XR(74, 109);
  wallRun(v, a, b, -12, -11, 4);                       // 后墙
  [a, b] = XR(74, 75); wallRun(v, a, b, -12, 21, 4);   // 侧墙
  [a, b] = XR(108, 109); wallRun(v, a, b, -12, 21, 4);
  [a, b] = XR(76, 83); wallRun(v, a, b, 21, 22, 4);    // 前墙段
  [a, b] = XR(100, 107); wallRun(v, a, b, 21, 22, 4);
  // 院门
  [a, b] = XR(84, 99);
  v.fill(a, b, 0, 0, 20, 23, C.marble);
  v.fill(a, b, 1, 6, 20, 23, C.wallRed);
  const [ga, gb] = XR(89, 94);
  archedGate(v, ga, gb, 1, 5, 20, 23);
  doorPanel(v, ga, gb, 1, 4, 23);
  hipRoof(v, { cx: sx * 91.5, cz: 21.5, w: 20, d: 8, y: 7, h: 3, ridge: 4 });

  // 正殿
  [a, b] = XR(73, 110);
  v.fill(a, b, 0, 0, -11, 12, C.marble);
  const colXs = [76, 82, 88, 94, 100, 106];
  for (const cx0 of colXs) {
    const [ca, cb] = XR(cx0, cx0 + 1);
    v.fill(ca, cb, 1, 9, 8, 9, C.columnRed);
    v.fill(ca, cb, 1, 9, -8, -7, C.columnRed);
  }
  for (const z0 of [-3, 2]) {
    const [ca, cb] = XR(76, 77);
    v.fill(ca, cb, 1, 9, z0, z0 + 1, C.columnRed);
    const [da, db] = XR(106, 107);
    v.fill(da, db, 1, 9, z0, z0 + 1, C.columnRed);
  }
  for (let k = 0; k < colXs.length - 1; k++) {
    const a0 = colXs[k] + 2, a1 = colXs[k + 1] - 1;
    const [la, lb] = XR(a0, a1);
    latticePlane(v, la, lb, 1, 8, 8);
    latticePlane(v, la, lb, 1, 8, -7);
  }
  // 两山墙 + 格窗
  {
    const [ca] = XR(76, 76);
    v.fill(ca, ca, 1, 9, -6, 6, C.wallRed);
    latticePlane(v, -3, 3, 3, 7, ca, 'x');
    const [da] = XR(107, 107);
    v.fill(da, da, 1, 9, -6, 6, C.wallRed);
    latticePlane(v, -3, 3, 3, 7, da, 'x');
  }
  // 额枋
  {
    const [ra, rb] = XR(76, 107);
    v.ring(ra, rb, -8, 9, 10, C.columnRed);
  }
  // 斗拱
  {
    const [a0, b0] = XR(75, 108);
    dougongBand(v, a0, b0, -9, 10, 11, []);
  }
  // 歇山顶（文华殿绿剪边）
  gableHipRoof(v, {
    cx: sx * 91.5, cz: 0.5, w: 40, d: 26, y: 12, h: 6, ridgeW: 10, gableH: 2,
    edge: greenEdge ? C.greenGlaze : C.tileYellowLight,
    gable: greenEdge ? C.greenDark : C.greenGlaze
  });
  tag(sx > 0 ? '文华殿' : '武英殿', sx * 91, 25, 1);
}

// ------------------------------------------------------------
// 内朝：乾清门 / 后三宫 / 东西六宫 / 御花园 / 神武门
// ------------------------------------------------------------
function slateRange(v, xa, xb, za, zb) {
  v.fill(xa, xb, 0, 3, za, zb, C.wallBody);
  v.fill(xa, xb, 0, 0, za, zb, C.marbleDark);
  hipRoof(v, {
    cx: (xa + xb) / 2, cz: (za + zb) / 2, w: xb - xa + 6, d: zb - za + 4, y: 4, h: 3,
    ridge: Math.max(4, zb - za - 8), banding: true, hipRidge: false,
    field: C.slateRoof, edge: 0x68727c, topColor: 0x43494f, tipColor: 0x68727c
  });
}

function qianqingGate(v) {
  // 乾清门（骑在前后朝分界墙上）
  v.fill(-19, 18, 0, 0, -141, -128, C.marble);
  v.fill(-16, 15, 1, 8, -139, -130, C.wallRed);
  archedGate(v, -2, 2, 1, 6, -139, -130);
  doorPanel(v, -2, 2, 1, 4, -130); doorPanel(v, -2, 2, 1, 4, -139);
  dougongBand(v, -18, 17, -141, -128, 9, []);
  hipRoof(v, { cx: -0.5, cz: -135, w: 40, d: 18, y: 10, h: 5, ridge: 8 });
  ridgeDeco(v, { y: 15, x0: -4, x1: 3, z: -136, z1: -135 });
  plaque(v, 0, 8, -128);
  // 两侧军机处 / 九卿房（灰瓦矮房）
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const xa = sx > 0 ? 20 + i * 8 : -27 - i * 8, xb = xa + 7 * sx;
      slateRange(v, Math.min(xa, xb), Math.max(xa, xb), -133, -129);
    }
  }
  cypress(v, 48, -128); cypress(v, -48, -128);
  tag('乾清门', -14, 18, -135);
}

function qianqingGong(v) {
  // 台基
  v.fill(-33, 32, 0, 1, -171, -146, C.marble);
  v.ring(-33, 32, -171, -146, 0, C.marbleDark);
  balustrade(v, -33, 32, -171, -146, 2, C.marble, (x, z) => z === -146 && x >= -4 && x <= 4);
  for (let s = 0; s < 2; s++) {
    v.fill(-4, 4, 0, 1 - s, -146 + s, -146 + s, C.marble);
    v.fill(-5, -5, 0, 2 - s, -146 + s, -146 + s, C.marble);
    v.fill(5, 5, 0, 2 - s, -146 + s, -146 + s, C.marble);
  }
  // 殿基 + 柱网（面阔九间，重檐歇山）
  v.fill(-27, 26, 2, 2, -169, -148, C.marble);
  const xs = [-24, -19, -14, -9, -4, 1, 6, 11, 16, 21];
  const sideZ = [-162, -156];
  for (const x of xs) {
    v.fill(x, x + 1, 3, 13, -149, -148, C.columnRed);
    v.fill(x, x + 1, 3, 13, -168, -167, C.columnRed);
  }
  for (const z of sideZ) {
    v.fill(-24, -23, 3, 13, z, z + 1, C.columnRed);
    v.fill(22, 23, 3, 13, z, z + 1, C.columnRed);
  }
  for (let k = 0; k < xs.length - 1; k++) {
    const a0 = xs[k] + 2, a1 = xs[k + 1] - 1;
    if (a1 >= a0) {
      latticePlane(v, a0, a1, 3, 13, -148);
      latticePlane(v, a0, a1, 3, 13, -167);
    }
  }
  v.fill(-24, -24, 3, 13, -166, -150, C.wallRed);
  v.fill(23, 23, 3, 13, -166, -150, C.wallRed);
  v.ring(-24, 23, -168, -149, 14, C.columnRed);
  dougongBand(v, -25, 24, -169, -148, 15, xs);
  hipRoof(v, {
    cx: -0.5, cz: -158.5, w: 56, d: 28, y: 16, h: 3, ridge: 6,
    hole: { x0: -17, x1: 16, z0: -165, z1: -152 }
  });
  for (let y = 16; y <= 20; y++) v.ring(-17, 16, -165, -152, y, C.wallRed);
  latticePlane(v, -16, 15, 17, 19, -165);
  latticePlane(v, -16, 15, 17, 19, -152);
  dougongBand(v, -18, 17, -166, -151, 21, [-16, -6, 5, 15]);
  gableHipRoof(v, { cx: -0.5, cz: -158.5, w: 48, d: 24, y: 22, h: 8, ridgeW: 14, gableH: 3 });
  ridgeDeco(v, { y: 30, x0: -7, x1: 6, z: -159, z1: -158 });
  plaque(v, 0, 14, -147);
  // 台基陈设
  sundial(v, 30, -150, 2); jialiang(v, -29, -150, 2);
  bronzeVat(v, -31, -160, 2); bronzeVat(v, 29, -160, 2);
  bronzeVat(v, -31, -168, 2); bronzeVat(v, 29, -168, 2);
  tag('乾清宫', 0, 36, -158);
}

function jiaotaiDian(v) {
  v.fill(-12, 11, 0, 1, -184, -172, C.marble);
  v.ring(-12, 11, -184, -172, 0, C.marbleDark);
  balustrade(v, -12, 11, -184, -172, 2);
  v.ring(-6, 5, -183, -172, 2, C.columnRed, 1);
  for (let y = 3; y <= 8; y++) v.ring(-6, 5, -183, -172, y, C.columnRed);
  for (const x of [-6, -1, 4]) {
    v.fill(x, x + 1, 2, 9, -172, -171, C.columnRed);
    v.fill(x, x + 1, 2, 9, -183, -182, C.columnRed);
  }
  v.fill(-6, -5, 2, 9, -178, -177, C.columnRed);
  v.fill(4, 5, 2, 9, -178, -177, C.columnRed);
  latticePlane(v, -4, 3, 3, 8, -171);
  latticePlane(v, -4, 3, 3, 8, -182);
  latticePlane(v, -182, -174, 3, 8, -5, 'x');
  latticePlane(v, -182, -174, 3, 8, 4, 'x');
  v.ring(-6, 5, -183, -172, 9, C.columnRed);
  v.ring(-6, 5, -183, -172, 10, C.columnRed);
  dougongBand(v, -7, 6, -184, -171, 11, []);
  pyramidRoof(v, { cx: -0.5, cz: -177.5, w: 22, d: 22, y: 12, h: 8 });
  finial(v, { x: -1, z: -178, y: 20 });
  plaque(v, 0, 10, -171);
  tag('交泰殿', 12, 27, -178);
}

function kunningGong(v) {
  v.fill(-22, 21, 0, 1, -200, -185, C.marble);
  v.ring(-22, 21, -200, -185, 0, C.marbleDark);
  balustrade(v, -22, 21, -200, -185, 2, C.marble, (x, z) => z === -185 && x >= -3 && x <= 3);
  for (let s = 0; s < 2; s++) v.fill(-3, 3, 0, 1 - s, -185 + s, -185 + s, C.marble);
  v.fill(-19, 18, 2, 2, -199, -186, C.marble);
  const xs = [-18, -13, -8, -3, 2, 7, 12, 17];
  for (const x of xs) {
    v.fill(x, x + 1, 3, 10, -187, -186, C.columnRed);
    v.fill(x, x + 1, 3, 10, -198, -197, C.columnRed);
  }
  v.fill(-18, -18, 3, 10, -196, -188, C.wallRed);
  v.fill(17, 17, 3, 10, -196, -188, C.wallRed);
  for (let k = 0; k < xs.length - 1; k++) {
    const a0 = xs[k] + 2, a1 = xs[k + 1] - 1;
    if (a1 >= a0) {
      latticePlane(v, a0, a1, 3, 10, -186);
      latticePlane(v, a0, a1, 3, 10, -197);
    }
  }
  v.ring(-18, 17, -198, -187, 11, C.columnRed);
  dougongBand(v, -19, 18, -199, -186, 12, xs);
  gableHipRoof(v, { cx: -0.5, cz: -192.5, w: 42, d: 20, y: 13, h: 6, ridgeW: 10, gableH: 2 });
  ridgeDeco(v, { y: 19, x0: -5, x1: 4, z: -193, z1: -192 });
  plaque(v, 0, 11, -185);
  tag('坤宁宫', -12, 24, -192);
}

function sixPalaces(v, sx) {
  // 东西六宫：每侧 2 列 × 3 行的宫院网格
  const cols = sx > 0 ? [[38, 66], [70, 98]] : [[-98, -70], [-66, -38]];
  const rows = [[-160, -143], [-178, -161], [-196, -179]];
  for (const [xa, xb] of cols) {
    for (const [za, zb] of rows) {
      // 院墙
      v.fill(xa, xb, 0, 3, za, za, C.wallBody);
      v.fill(xa, xb, 0, 3, zb, zb, C.wallBody);
      v.fill(xa, xa, 0, 3, za, zb, C.wallBody);
      v.fill(xb, xb, 0, 3, za, zb, C.wallBody);
      v.fill(xa - 1, xb + 1, 4, 4, za - 1, zb + 1, C.copingTile);
      // 南门（豁口）
      const cx = Math.round((xa + xb) / 2);
      v.carve(cx - 2, cx + 1, 0, 3, za, za);
      v.fill(cx - 3, cx - 3, 0, 4, za, za, C.columnRed);
      v.fill(cx + 2, cx + 2, 0, 4, za, za, C.columnRed);
      v.fill(cx - 3, cx + 2, 4, 4, za, za, C.copingTile);
      // 正殿
      const hx0 = cx - 8, hx1 = cx + 7, hz0 = za + 3, hz1 = za + 10;
      v.fill(hx0 - 2, hx1 + 2, 0, 0, hz0 - 2, hz1 + 2, C.marble);
      for (const x of [hx0, hx1 - 1]) {
        v.fill(x, x + 1, 1, 4, hz1, hz1, C.columnRed);
        v.fill(x, x + 1, 1, 4, hz0, hz0, C.columnRed);
      }
      v.fill(hx0, hx0, 1, 4, hz0 + 1, hz1 - 1, C.wallRed);
      v.fill(hx1, hx1, 1, 4, hz0 + 1, hz1 - 1, C.wallRed);
      latticePlane(v, hx0 + 1, hx1 - 1, 1, 4, hz1);
      latticePlane(v, hx0 + 1, hx1 - 1, 1, 4, hz0);
      v.ring(hx0, hx1, hz0, hz1, 5, C.columnRed);
      dougongBand(v, hx0 - 1, hx1 + 1, hz0 - 1, hz1 + 1, 6, []);
      hipRoof(v, { cx: (hx0 + hx1) / 2, cz: (hz0 + hz1) / 2, w: 20, d: 12, y: 7, h: 3, ridge: 6 });
      cypress(v, cx + 10, zb - 2);
    }
  }
  // 筒子连房（外墙一顺灰瓦房）
  for (const [za, zb] of rows) {
    slateRange(v, sx > 0 ? 102 : -132, sx > 0 ? 132 : -102, za + 1, zb - 1);
  }
}

function imperialGarden(v) {
  // 钦安殿
  v.fill(-10, 9, 0, 0, -209, -201, C.marble);
  v.fill(-8, 7, 1, 5, -208, -202, C.wallRed);
  archedGate(v, -2, 2, 1, 3, -208, -202);
  dougongBand(v, -9, 8, -209, -201, 6, []);
  hipRoof(v, { cx: -0.5, cz: -205, w: 20, d: 12, y: 7, h: 3, ridge: 6 });
  v.set(-1, 10, -205, C.gold); v.set(0, 10, -205, C.gold);
  plaque(v, 0, 5, -200);
  // 天一门
  v.fill(-7, 6, 0, 3, -200, -199, C.wallRed);
  v.carve(-2, 2, 0, 2, -200, -199);
  v.fill(-8, 7, 4, 4, -201, -198, C.copingTile);
  // 堆秀山 + 御景亭（东部假山）
  const mound = [
    [8, 24, -213, -205], [10, 22, -212, -206], [12, 20, -211, -206],
    [13, 19, -210, -206], [14, 18, -209, -207]
  ];
  mound.forEach(([xa, xb, za, zb], i) => {
    for (let x = xa; x <= xb; x++)
      for (let z = za; z <= zb; z++)
        v.set(x, i, z, ((x + z) % 3 === 0) ? C.marbleDark : C.rockGray);
  });
  v.fill(14, 18, 5, 5, -209, -207, C.marble);
  for (const [px, pz] of [[14, -209], [17, -209], [14, -207], [17, -207]]) {
    v.fill(px, px, 6, 8, pz, pz, C.columnRed);
  }
  hipRoof(v, { cx: 16, cz: -208, w: 7, d: 5, y: 9, h: 3, ridge: 3 });
  v.set(16, 12, -208, C.gold);
  // 对称双亭（万春 / 千秋）
  for (const sx of [-1, 1]) {
    const px = sx * 20;
    v.fill(px - 3, px + 3, 0, 0, -204, -197, C.marble);
    for (const [qx, qz] of [[px - 2, -203], [px + 2, -203], [px - 2, -198], [px + 2, -198]]) {
      v.fill(qx, qx, 1, 3, qz, qz, C.columnRed);
    }
    v.fill(px - 3, px + 3, 4, 4, -204, -197, C.columnRed);
    pyramidRoof(v, { cx: px - 0.5, cz: -200.5, w: 10, d: 10, y: 5, h: 4 });
    finial(v, { x: sx > 0 ? px - 1 : px, z: -201, y: 9 });
  }
  // 古树
  broadTree(v, -26, -204); cypress(v, -26, -210); cypress(v, -13, -212);
  cypress(v, -3, -212); broadTree(v, 4, -212); cypress(v, 26, -202);
  cypress(v, -10, -198);
  tag('御花园', 14, 22, -206);
}

function shenwuGate(v) {
  v.fill(-24, 23, 0, 0, -219, -208, C.marble);
  v.fill(-20, 19, 1, 9, -218, -209, C.wallRed);
  archedGate(v, -2, 2, 1, 6, -218, -209);
  doorPanel(v, -2, 2, 1, 4, -209); doorPanel(v, -2, 2, 1, 4, -218);
  dougongBand(v, -22, 21, -219, -208, 10, []);
  hipRoof(v, { cx: -0.5, cz: -213.5, w: 50, d: 18, y: 11, h: 5, ridge: 8 });
  ridgeDeco(v, { y: 16, x0: -4, x1: 3, z: -214, z1: -213 });
  plaque(v, 0, 9, -208);
  tag('神武门', 0, 22, -214);
}

function buildInnerCourt(v) {
  qianqingGate(v);
  qianqingGong(v);
  jiaotaiDian(v);
  kunningGong(v);
  sixPalaces(v, 1);
  sixPalaces(v, -1);
  imperialGarden(v);
  shenwuGate(v);
}

// ------------------------------------------------------------
// 陈设细节
// ------------------------------------------------------------
function buildDetails(v) {
  // 石狮
  lion(v, -19, 42); lion(v, 17, 42);          // 太和门前
  lion(v, -11, 61); lion(v, 9, 61);           // 午门内
  // 铜缸
  bronzeVat(v, -22, 41); bronzeVat(v, 20, 41);            // 太和门
  for (const z of [-54, -44, -34]) {                       // 太和殿台基上
    bronzeVat(v, -42, z, 7); bronzeVat(v, 41, z, 7);
  }
  bronzeVat(v, -22, -128); bronzeVat(v, 20, -128);        // 乾清门
  // 日晷 / 嘉量
  sundial(v, 34, -26, 7);
  jialiang(v, -34, -26, 7);
  // 十八槐（广场东、西夹道古树）
  for (const sx of [-1, 1]) {
    for (const z of [18, 8, -2]) broadTree(v, sx * 68, z);
    cypress(v, sx * 68, -9);
  }
}

// ------------------------------------------------------------
// 总装
// ------------------------------------------------------------
export function buildLayout(v) {
  buildWalls(v);
  buildWuGate(v);
  buildCanal(v);
  buildTaiheGate(v);
  buildTerrace(v);
  buildTaiheHall(v);
  buildZhongheHall(v);
  buildBaoheHall(v);
  buildSideHall(v, 1, true);    // 文华殿（东，绿剪边）
  buildSideHall(v, -1, false);  // 武英殿（西）
  buildInnerCourt(v);
  buildDetails(v);
  return LABELS;
}
