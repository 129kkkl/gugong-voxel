import * as THREE from 'three';

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

/** 青砖地面 */
export function makeBrickTexture() {
  const c = canvas(512);
  const g = c.getContext('2d');
  g.fillStyle = '#6d7175';
  g.fillRect(0, 0, 512, 512);
  const bw = 64, bh = 32, gap = 3;
  for (let row = 0; row < 512 / bh; row++) {
    const off = (row % 2) * (bw / 2);
    for (let col = -1; col < 512 / bw + 1; col++) {
      const x = col * bw + off, y = row * bh;
      const t = Math.random();
      const l = 124 + t * 26;
      g.fillStyle = `rgb(${l | 0}, ${(l + 1) | 0}, ${(l + 5) | 0})`;
      g.fillRect(x + gap / 2, y + gap / 2, bw - gap, bh - gap);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(90, 80);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** 汉白玉铺装广场 */
export function makeMarbleTexture() {
  const c = canvas(512);
  const g = c.getContext('2d');
  g.fillStyle = '#d8d2c4';
  g.fillRect(0, 0, 512, 512);
  const cell = 64, gap = 3;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const t = Math.random();
      const l = 208 + t * 20;
      g.fillStyle = `rgb(${l | 0}, ${(l - 4) | 0}, ${(l - 14) | 0})`;
      g.fillRect(col * cell + gap / 2, row * cell + gap / 2, cell - gap, cell - gap);
    }
  }
  // 细碎石纹
  g.globalAlpha = 0.08;
  for (let i = 0; i < 900; i++) {
    g.fillStyle = Math.random() > 0.5 ? '#8a8478' : '#ffffff';
    g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(22, 28);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** 晨昏天空（自上而下渐变） */
export function makeSkyTexture() {
  const c = canvas(256);
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, '#4f7cbe');
  grad.addColorStop(0.35, '#8fb2d8');
  grad.addColorStop(0.58, '#e8c9a0');
  grad.addColorStop(0.75, '#f2d9b0');
  grad.addColorStop(1.0, '#e8c294');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
