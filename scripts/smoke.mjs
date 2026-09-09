// Node 冒烟测试：不依赖浏览器，跑通全部布局构建并抽查关键体素
import { Voxels } from '../src/voxels.js';
import { buildLayout } from '../src/layout.js';

const vox = new Voxels();
const labels = buildLayout(vox);

let fail = 0;
function check(name, cond) {
  console.log(`${cond ? '✓' : '✗ FAIL'} ${name}`);
  if (!cond) fail++;
}

const n = vox.size;
console.log(`体素总数: ${n.toLocaleString()}`);
check('体素总量在合理区间 (50k ~ 450k)', n > 50000 && n < 450000);

// 边界
let bad = null;
for (const k of vox.map.keys()) {
  const [x, y, z] = k.split('|').map(Number);
  if (Math.abs(x) > 150 || z < -228 || z > 105 || y < 0 || y > 48) { bad = k; break; }
}
check('所有体素均在场地边界内', bad === null);

// 关键位置抽查
const has = (x, y, z) => vox.map.has(`${x}|${y}|${z}`);
check('太和殿上层屋脊 (y≈37)', has(0, 37, -43) || has(-1, 37, -43) || has(0, 37, -42));
check('中和殿鎏金宝顶 (y≈26)', has(-1, 26, -78) || has(0, 26, -78));
check('保和殿歇山山花/屋顶 (y≈30-33)', has(-7, 33, -102) || has(14, 30, -101));
check('三大殿台基顶面 (y=6)', has(0, 6, -42) && has(0, 6, -101) && has(0, 6, -76));
check('午门城台 (y=5)', has(-10, 5, 80));
check('宫墙 (x=-134)', has(-134, 3, 0));
check('金水桥桥面 (z=48)', has(0, 3, 48) || has(0, 4, 48));
check('文华殿柱 (x≈88)', has(88, 2, 8) || has(82, 2, 8));
check('武英殿柱 (x≈-89)', has(-89, 2, -8) || has(-83, 2, -8));
check('角楼十字脊顶部 (y≈25)', has(-134, 25, -213) || has(-135, 25, -213) || has(134, 25, 92));
check('门洞贯通（午门中门 y=4）', !has(0, 4, 80) && !has(0, 4, 90));
check('乾清宫屋脊 (y≈30)', has(0, 30, -159) || has(-1, 30, -159) || has(0, 30, -158));
check('交泰殿宝顶 (y≈20)', has(-1, 20, -178) || has(0, 20, -178));
check('坤宁宫屋顶 (y≈17-19)', has(0, 18, -192) || has(0, 19, -193) || has(-5, 17, -192));
check('东西六宫院墙', has(38, 2, -160) || has(66, 2, -160) || has(-98, 2, -178));
check('御花园堆秀山 (y≈3)', has(18, 3, -208) || has(15, 2, -208) || has(20, 1, -209));
check('体仁阁 (x≈68)', has(68, 3, -38) || has(67, 3, -38) || has(69, 3, -37));
check('朝房墙体 (x≈98)', has(98, 2, 65) || has(98, 2, 81) || has(-98, 2, 65));
check('建筑名称标签 ≥ 15', labels.length >= 15);

console.log(fail === 0 ? '\n冒烟测试全部通过 ✓' : `\n${fail} 项未通过 ✗`);
process.exit(fail === 0 ? 0 : 1);
