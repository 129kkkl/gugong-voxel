import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Voxels } from './voxels.js';
import { buildLayout } from './layout.js';
import { C } from './palette.js';
import { makeBrickTexture, makeMarbleTexture, makeSkyTexture } from './textures.js';

// ---------- 渲染器 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('app').appendChild(renderer.domElement);

// ---------- 场景 ----------
const scene = new THREE.Scene();
scene.background = makeSkyTexture();
scene.fog = new THREE.Fog(0xe6c9a2, 420, 1100);

// ---------- 相机 ----------
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 1, 2400);
const CAM_TARGET = new THREE.Vector3(0, 8, -60);
const CAM_HOME = new THREE.Vector3(185, 128, 262);
const CAM_FAR = new THREE.Vector3(300, 195, 380);
camera.position.copy(CAM_FAR);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(CAM_TARGET);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 40;
controls.maxDistance = 700;
controls.maxPolarAngle = Math.PI * 0.49;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.45;

// ---------- 光照（晨昏） ----------
const hemi = new THREE.HemisphereLight(0xa9c6e8, 0x9a8a74, 0.55);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffe7c4, 1.5);
sun.position.set(190, 125, 170);
sun.target.position.set(0, 0, -60);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.camera.left = -215;
sun.shadow.camera.right = 215;
sun.shadow.camera.top = 215;
sun.shadow.camera.bottom = -215;
sun.shadow.camera.near = 20;
sun.shadow.camera.far = 800;
sun.shadow.bias = -0.0001;
sun.shadow.normalBias = 1.8;
scene.add(sun);
scene.add(sun.target);

const fill = new THREE.DirectionalLight(0x9db8dd, 0.15);
fill.position.set(-160, 90, -120);
scene.add(fill);

// ---------- 地面 ----------
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(760, 680),
  new THREE.MeshLambertMaterial({ map: makeBrickTexture() })
);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.02, -21);
ground.receiveShadow = true;
scene.add(ground);

function slab(w, d, x, z, tex, repeatX, repeatZ, color = 0xffffff) {
  const t = tex.clone();
  t.needsUpdate = true;
  t.repeat.set(repeatX, repeatZ);
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.12, d),
    new THREE.MeshLambertMaterial({ map: t, color })
  );
  m.position.set(x, 0.0, z);
  m.receiveShadow = true;
  scene.add(m);
  return m;
}
const marbleTex = makeMarbleTexture();
slab(136, 178, 0, -22, marbleTex, 17, 22);            // 主广场（太和门—三大殿）
slab(136, 12, 0, 59, marbleTex, 17, 2);               // 午门—金水河庭院
slab(44, 38, 91.5, 5, marbleTex, 6, 5);               // 文华殿院
slab(44, 38, -91.5, 5, marbleTex, 6, 5);              // 武英殿院
slab(132, 24, 0, -124, marbleTex, 16, 3);             // 乾清门广场
slab(68, 78, 0, -175, marbleTex, 8, 10);              // 后三宫中轴庭院（含御花园）

// 金水河水面（纯色，不铺砖纹）
{
  const water = new THREE.Mesh(
    new THREE.BoxGeometry(270, 0.3, 10.6),
    new THREE.MeshLambertMaterial({ color: 0x3d6b85 })
  );
  water.position.set(0, 0.05, 48);
  water.receiveShadow = true;
  scene.add(water);
}

// ---------- 体素云 ----------
const cloudMat = new THREE.MeshLambertMaterial({ color: 0xfff6ea, transparent: true, opacity: 0.85 });
const clouds = new THREE.Group();
function puff(x, y, z, sx, sy, sz) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), cloudMat);
  m.position.set(x, y, z);
  clouds.add(m);
}
puff(-150, 138, -80, 26, 6, 16); puff(-128, 142, -74, 15, 5, 11); puff(-106, 136, -84, 11, 5, 9);
puff(130, 148, -190, 30, 7, 18); puff(168, 152, -184, 17, 5, 12); puff(96, 144, -196, 13, 5, 10);
puff(40, 156, 130, 24, 6, 14); puff(-70, 160, 160, 15, 5, 11); puff(-170, 152, 60, 20, 6, 13);
scene.add(clouds);

// ---------- 体素建筑 ----------
const t0 = performance.now();
const vox = new Voxels();
const labels = buildLayout(vox);
console.log(`[gugong] 体素数: ${vox.size.toLocaleString()}，构建耗时 ${(performance.now() - t0).toFixed(0)}ms`);
const cityMesh = vox.build();
scene.add(cityMesh);

// ---------- 建筑名称标签 ----------
const labelBox = document.getElementById('labels');
const labelEls = labels.map(l => {
  const el = document.createElement('div');
  el.className = 'blabel';
  el.textContent = l.name;
  labelBox.appendChild(el);
  return { el, pos: new THREE.Vector3(l.x, l.y, l.z) };
});
let showLabels = true;
document.getElementById('toggle-labels').addEventListener('change', e => {
  showLabels = e.target.checked;
  labelEls.forEach(o => o.el.style.opacity = showLabels ? '' : '0');
});
document.getElementById('toggle-rotate').addEventListener('change', e => {
  controls.autoRotate = e.target.checked;
});
renderer.domElement.addEventListener('pointerdown', () => {
  controls.autoRotate = false;
  document.getElementById('toggle-rotate').checked = false;
}, { once: false });

// ---------- 预设机位 ----------
const VIEWS = {
  home:   { p: [185, 128, 262], t: [0, 8, -60] },
  taihe:  { p: [128, 55, 62],   t: [0, 24, -42] },
  wumen:  { p: [46, 42, 200],   t: [0, 14, 78] },
  garden: { p: [70, 52, -120],  t: [0, 8, -202] },
  north:  { p: [-90, 80, 60],   t: [0, 12, -140] }
};
let camAnim = null;
function flyTo(view, dur = 1.8) {
  controls.autoRotate = false;
  document.getElementById('toggle-rotate').checked = false;
  camAnim = {
    p0: camera.position.clone(), t0: controls.target.clone(),
    p1: new THREE.Vector3(...view.p), t1: new THREE.Vector3(...view.t), t: 0, dur
  };
}
document.querySelectorAll('.views button').forEach(btn => {
  btn.addEventListener('click', () => flyTo(VIEWS[btn.dataset.view]));
});

const proj = new THREE.Vector3();
const distV = new THREE.Vector3();
function updateLabels() {
  if (!showLabels) return;
  for (const { el, pos } of labelEls) {
    distV.copy(pos).sub(camera.position);
    const dist = distV.length();
    proj.copy(pos).project(camera);
    const behind = proj.z > 1;
    const x = (proj.x * 0.5 + 0.5) * innerWidth;
    const y = (-proj.y * 0.5 + 0.5) * innerHeight;
    const inView = !behind && x > -50 && x < innerWidth + 50 && y > 0 && y < innerHeight;
    const fade = dist > 460 ? 0 : (dist > 380 ? (460 - dist) / 80 : 1);
    const opacity = inView ? fade : 0;
    el.style.opacity = opacity <= 0.05 ? '0' : String(opacity);
    if (inView && fade > 0.05) {
      el.style.left = x + 'px';
      el.style.top = y + 'px';
    }
  }
}

// ---------- FPS ----------
const fpsEl = document.getElementById('fps');
let frames = 0, fpsTimer = 0;

// ---------- 开场推近 ----------
let introT = 0;
const INTRO = 3.0;

// ---------- 主循环 ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);

  if (introT < INTRO) {
    introT += dt;
    const k = Math.min(introT / INTRO, 1);
    const e = 1 - Math.pow(1 - k, 3); // easeOutCubic
    camera.position.lerpVectors(CAM_FAR, CAM_HOME, e);
  }

  // 机位飞行
  if (camAnim) {
    camAnim.t += dt / camAnim.dur;
    const k = Math.min(camAnim.t, 1);
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    camera.position.lerpVectors(camAnim.p0, camAnim.p1, e);
    controls.target.lerpVectors(camAnim.t0, camAnim.t1, e);
    if (k >= 1) camAnim = null;
  }

  // 云缓缓漂移
  clouds.children.forEach((m, i) => {
    m.position.x += dt * (1.2 + (i % 3) * 0.4);
    if (m.position.x > 420) m.position.x = -420;
  });

  controls.update();
  updateLabels();

  frames++;
  fpsTimer += dt;
  if (fpsTimer >= 0.5) {
    fpsEl.textContent = Math.round(frames / fpsTimer) + ' fps';
    frames = 0; fpsTimer = 0;
  }
  renderer.render(scene, camera);
}
animate();

// 首帧后撤下加载幕
requestAnimationFrame(() => requestAnimationFrame(() => {
  const loading = document.getElementById('loading');
  loading.style.opacity = '0';
  setTimeout(() => loading.remove(), 900);
}));

// ---------- 自适应 ----------
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// 调试钩子（自动化测试用）
window.__GUGONG = { scene, camera, controls, renderer, vox };
