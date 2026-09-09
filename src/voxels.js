import * as THREE from 'three';
import { vary } from './palette.js';

/**
 * 体素世界：Map 覆盖式写入（后画盖前画），最终合并为单个 InstancedMesh。
 * 坐标约定：set(x, y, z) 中 x/z 为整数格，y 为层号（0 层贴地面）。
 */
export class Voxels {
  constructor() {
    this.map = new Map(); // "x|y|z" -> hex color
  }

  static key(x, y, z) { return x + '|' + y + '|' + z; }

  set(x, y, z, color) {
    this.map.set(Voxels.key(x | 0, y | 0, z | 0), color);
  }

  clear(x, y, z) {
    this.map.delete(Voxels.key(x | 0, y | 0, z | 0));
  }

  fill(x0, x1, y0, y1, z0, z1, color) {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
        for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
          this.set(x, y, z, color);
  }

  // 矩形环（外圈，可指定厚度）
  ring(x0, x1, z0, z1, y, color, t = 1) {
    for (let i = 0; i < t; i++) {
      const xa = x0 + i, xb = x1 - i, za = z0 + i, zb = z1 - i;
      if (xb < xa || zb < za) return;
      this.fill(xa, xb, y, y, za, zb, color);
    }
  }

  // 挖除矩形
  carve(x0, x1, y0, y1, z0, z1) {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
        for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
          this.clear(x, y, z);
  }

  merge(other) {
    for (const [k, v] of other.map) this.map.set(k, v);
  }

  get size() { return this.map.size; }

  /** 合并为一个 InstancedMesh（逐体素颜色 + 确定性微扰动） */
  build() {
    const count = this.map.size;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const m = new THREE.Matrix4();
    let i = 0;
    for (const [k, color] of this.map) {
      const [xs, ys, zs] = k.split('|');
      const x = +xs, y = +ys, z = +zs;
      m.makeTranslation(x, y + 0.5, z);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, vary(color, x, y, z));
      i++;
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    return mesh;
  }
}
