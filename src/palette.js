import { Color } from 'three';

// 故宫体素调色板
export const C = {
  // 墙体
  wallRed: 0x8f1d10,
  wallRedDark: 0x6e150b,
  columnRed: 0xa62c1a,
  latticeLight: 0xa8382a,
  latticeDark: 0x5f2015,
  doorNail: 0xd4af37,

  // 琉璃瓦
  tileYellow: 0xf2b31d,
  tileYellowLight: 0xfac83e,
  tileYellowDark: 0xd39a17,
  ridgeDark: 0x8f6a1d,
  greenGlaze: 0x3f7a58,   // 绿剪边 / 山花
  greenDark: 0x2c5a40,

  // 彩画
  dougongGreen: 0x2f6e5a,
  dougongBlue: 0x2e5a8f,
  gold: 0xd4af37,
  goldBright: 0xf0c94a,

  // 汉白玉
  marble: 0xe9e4d8,
  marbleMid: 0xdcd6c8,
  marbleDark: 0xc9c2b2,
  rampStone: 0xd4ccbb,

  // 陈设
  bronze: 0x8a6a3c,
  bronzeGold: 0xc9a227,
  stoneLion: 0xcac3b2,
  lanternRed: 0xc0392b,
  water: 0x4a7c96,
  paveDark: 0xb59d72,

  // 宫墙
  wallBody: 0x8a1e12,
  copingTile: 0xefad14,

  // 扩展
  slateRoof: 0x50585f,     // 朝房灰瓦
  trunk: 0x6b4a2f,
  leafA: 0x2f6b33,
  leafB: 0x3d7c40,
  plaqueBlue: 0x153a6e,
  rockGray: 0x8a8d92
};

// 纯数值明度缩放（不依赖 three，供屋顶瓦垄使用）
export function shade(hex, f) {
  const r = Math.min(255, Math.round((hex >> 16 & 255) * f));
  const g = Math.min(255, Math.round((hex >> 8 & 255) * f));
  const b = Math.min(255, Math.round((hex & 255) * f));
  return (r << 16) | (g << 8) | b;
}

// 基于坐标的确定性伪随机（保证重建时颜色稳定）
export function hash3(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

// 颜色微扰动：直接在自身色相上做轻微明度抖动，保留饱和度
export function vary(color, x, y, z, amt = 0.055) {
  const c = new Color(color);
  const h = (hash3(x, y, z) - 0.5) * 2 * amt;
  c.offsetHSL(0, 0, h);
  return c;
}
