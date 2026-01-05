import * as THREE from "./three.js-master/build/three.module.js";
import { EXRLoader } from "./three.js-master/examples/jsm/loaders/EXRLoader.js";
import { OrbitControls } from "./three.js-master/examples/jsm/controls/OrbitControls.js";
// @ts-check

/* ---------- SCENE / CAMERA / RENDERER ---------- */

const loadingFinished = () => {
  const loadingElem = document.querySelector(".loading");
  if (loadingElem) {
    loadingElem.classList.add("hidden");
  }
  const navElem = document.querySelector(".global-nav");
  if (navElem) {
    navElem.classList.remove("hidden");
  }
  const homePageElem = document.querySelector(".page-home");
  if (homePageElem) {
    homePageElem.classList.remove("hidden");
  }
};

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

const bar = document.querySelector(".loading-bar");

let done = 0;
const total = 5;

const track = (promise) =>
  promise.finally(() => {
    done++;
    if (bar) bar.style.width = `${(done / total) * 100}%`;
  });
export const backgrounds = [];

Promise.all([
  track(loadEXR("/static/models/bg1.exr")),
  track(loadEXR("/static/models/nature.exr")),
  track(loadEXR("/static/models/sky1.exr")),
  track(loadEXR("/static/models/sky2.exr")),
  track(loadEXR("/static/models/nature3.exr")),
])
.then((textures) => {
  backgrounds[0] = textures[0];
  backgrounds[1] = textures[1];
  backgrounds[2] = textures[2];
  backgrounds[3] = textures[3];
  backgrounds[4] = textures[4];

  bgCurrent = createBgSphere(backgrounds[0]);
  bgGroup.add(bgCurrent);

  if (bar) bar.style.width = "100%";
  setTimeout(loadingFinished, 200);
})
.catch(console.error);

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
// ===== LOADING BAR CONTROL =====

