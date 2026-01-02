import * as THREE from "./three.js-master/build/three.module.js";
import { EXRLoader } from "./three.js-master/examples/jsm/loaders/EXRLoader.js";
import { OrbitControls } from "./three.js-master/examples/jsm/controls/OrbitControls.js";
// @ts-check

/* ---------- SCENE / CAMERA / RENDERER ---------- */
/*
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
document.body.appendChild(renderer.domElement);

/* ---------- CONTROLS ---------- */

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* ---------- RESIZE ---------- */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------- BACKGROUND GROUP ---------- */

const bgGroup = new THREE.Group();
scene.add(bgGroup);

function createBgSphere(texture) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(50, 64, 64),
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 1,
    })
  );
}

/* ---------- LOADER ---------- */

function loadEXR(path) {
  return new Promise((resolve) => {
    new EXRLoader().load(path, (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      resolve(tex);
    });
  });
}

/* ---------- EASING ---------- */

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/* ---------- FADE STATE ---------- */

let bgCurrent = null;
let bgNext = null;
let fading = false;
let fadeStart = 0;

const FADE_TIME = 1500;
const FADE_ROTATION = Math.PI / 3;
let startRotation = 0;
let bgRotationSpeed = 0.0003;

/* ---------- FADE FUNCTION ---------- */

export function fadeToBackground(texture) {
  if (fading || !texture) return;

  bgNext = createBgSphere(texture);
  bgNext.material.opacity = 0;
  bgGroup.add(bgNext);

  startRotation = bgGroup.rotation.y;
  fadeStart = performance.now();
  fading = true;
}

function updateBackgroundFade() {
  if (!fading) return;

  const t = Math.min((performance.now() - fadeStart) / FADE_TIME, 1);
  const e = easeInOut(t);

  if (bgCurrent) bgCurrent.material.opacity = 1 - e;
  if (bgNext) bgNext.material.opacity = e;

  bgGroup.rotation.y = startRotation + FADE_ROTATION * e;

  if (t === 1) {
    if (bgCurrent) bgGroup.remove(bgCurrent);
    bgCurrent = bgNext;
    bgNext = null;
    fading = false;
    startRotation = bgGroup.rotation.y;
  }
}

/* ---------- PRELOAD BACKGROUNDS ---------- */

export const backgrounds = [];
/*
loadEXR("/static/models/bg1.exr").then((tex) => {
  backgrounds[0] = tex;
  bgCurrent = createBgSphere(tex);
  bgGroup.add(bgCurrent);
});

Promise.all([
  loadEXR("/static/models/nature.exr"),   // [0]
  loadEXR("/static/models/sky1.exr"),     // [1]
  loadEXR("/static/models/sky2.exr"),     // [2]
  loadEXR("/static/models/nature3.exr"),  // [3]
])
.then((textures) => {

  /* ===========================
     HDRI 1 — nature.exr
     =========================== */
  backgrounds[1] = textures[0];
  textures[0].userData = {
    rotX: 0,
    rotY: 0,
  };

  /* ===========================
     HDRI 2 — sky1.exr
     =========================== */
  backgrounds[2] = textures[1];
  textures[1].userData = {
    rotX: 0,
    rotY: Math.PI / 2,
  };

  /* ===========================
     HDRI 3 — sky2.exr
     =========================== */
  backgrounds[3] = textures[2];
  textures[2].userData = {
    rotX: THREE.MathUtils.degToRad(10),
    rotY: Math.PI,
  };

  /* ===========================
     HDRI 4 — nature3.exr
     =========================== */
  backgrounds[4] = textures[3];
  textures[3].userData = {
    rotX: 0,
    rotY: -Math.PI / 2,
  };

  // ✅ everything loaded and configured here
  // safe to enable UI / first background

})
.catch((err) => {
  console.error("Background load failed:", err);
});

/* ---------- ANIMATION LOOP ---------- */

function animate() {
  requestAnimationFrame(animate);

  if (!fading) {
    bgGroup.rotation.y += bgRotationSpeed;
  }

  updateBackgroundFade();
  controls.update();
  renderer.render(scene, camera);
}

animate();
