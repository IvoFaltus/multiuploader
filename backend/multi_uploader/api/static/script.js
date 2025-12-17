import * as THREE from './three.js-master/build/three.module.js';
import { EXRLoader } from './three.js-master/examples/jsm/loaders/EXRLoader.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
// @ts-check

/* ---------- SCENE / CAMERA / RENDERER ---------- */


/*logic*/ 


let location = "home";

Element.prototype.delayedRemove = function (className, delay) {
  setTimeout(() => {
    this.classList.remove(className);
  }, delay);
};





const switchToPage = (page)=>{

if (!backgrounds.length) return;

  fadeToBackground(toggle ? backgrounds[0] : backgrounds[1]);
  toggle = !toggle;




const selector = `body *:not(.${page}):not(.${page} *)`;
document.querySelectorAll(selector).forEach(el => {
  el.classList.add('hidden');
});




document.querySelectorAll(`.${page}`).forEach(e=>{





  e.delayedRemove('hidden',1000);
})
  

}

document.querySelector("#login").addEventListener("click",()=>{

switchToPage("login");

})
/**/ 






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
document.body.appendChild(renderer.domElement);

/* ---------- CONTROLS ---------- */

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* ---------- RESIZE ---------- */

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------- BACKGROUND SPHERES ---------- */

const bgGroup = new THREE.Group();
scene.add(bgGroup);

function createBgSphere(texture) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(50, 64, 64),
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 1
    })
  );
}

/* ---------- LOADER (PROMISE) ---------- */

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
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/* ---------- FADE / ROTATION STATE ---------- */

let bgCurrent = null;
let bgNext = null;
let fading = false;
let fadeStart = 0;

const FADE_TIME = 1500;
const FADE_ROTATION = Math.PI / 3; // 60° during transition
let startRotation = 0;

let bgRotationSpeed = 0.0002; // constant slow rotation

/* ---------- FADE METHODS ---------- */

function fadeToBackground(texture) {
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
  bgNext.material.opacity = e;

  bgGroup.rotation.y = startRotation + FADE_ROTATION * e;

  if (t === 1) {
    if (bgCurrent) bgGroup.remove(bgCurrent);
    bgCurrent = bgNext;
    bgNext = null;
    fading = false;
  }
}

/* ---------- PRELOAD BACKGROUNDS ---------- */

let backgrounds = [];

Promise.all([
  loadEXR('/static/models/bg10.exr'),
  loadEXR('/static/models/nature.exr')
]).then((textures) => {
  backgrounds = textures;

  bgCurrent = createBgSphere(backgrounds[0]);
  bgGroup.add(bgCurrent);
});

/* ---------- ANIMATION LOOP (ONLY ONE) ---------- */

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

/* ---------- BUTTON ---------- */

let toggle = false;
document.querySelector('#rotateBtn').addEventListener('click', () => {
  if (!backgrounds.length) return;

  fadeToBackground(toggle ? backgrounds[0] : backgrounds[1]);
  toggle = !toggle;
});
renderer.toneMappingExposure = 0.5;
