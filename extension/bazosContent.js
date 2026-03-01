// ======================================================
// BAZOS CONTENT SCRIPT — FIXED, STABLE VERSION
// ======================================================
function injectMyFont() {
  if (document.getElementById("myfont-style")) return;

  const style = document.createElement("style");
  style.id = "myfont-style";
  style.textContent = `
    @font-face {
      font-family: "MyFont";
      src: url("${chrome.runtime.getURL("fonts/GreaterTheory.otf")}") format("opentype");
    }
  `;
  document.head.appendChild(style);
}
function getDropzoneInstance() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.textContent = `
      (function() {
        if (window.myDropzone) {
          window.dispatchEvent(
            new CustomEvent("DROPZONE_READY", { detail: window.myDropzone })
          );
        }
      })();
    `;
    document.documentElement.appendChild(script);
    script.remove();

    window.addEventListener("DROPZONE_READY", (e) => {
      resolve(e.detail);
    }, { once: true });
  });
}

function base64ToFile(base64, filename = "photo.jpg") {
  const [meta, content] = base64.split(",");
  const mime = meta.match(/data:(.*);base64/)?.[1] || "image/jpeg";
  const bytes = atob(content);
  const arr = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }

  return new File([arr], filename, { type: mime });
}
// ======================================================
// GLOBAL STATE
// ======================================================
let data = null;



const priceTypeMap = {
  "Dohodou": "2",
  "Nabídněte": "3",
  "Nerozhoduje": "4",
  "V textu": "5",
  "Zdarma": "6"
};

// ======================================================
// UTIL — WAIT FOR ELEMENT
// ======================================================
function waitForElement(fn, cb, interval = 200) {
  const t = setInterval(() => {
    const el = fn();
    if (el) {
      clearInterval(t);
      cb(el);
    }
  }, interval);
}

// ======================================================
// SAFE VALUE SETTER (INPUT / TEXTAREA / SELECT)
// ======================================================
function setValue(el, value) {
  if (!el) return;

  const proto =
    el instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : el instanceof HTMLSelectElement
          ? HTMLSelectElement.prototype
          : null;

  if (!proto) return;

  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  el.focus();
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.blur();
}


function addDebugCube() {


  const cube = document.createElement("div");
  cube.id = "DEBUG_CUBE";
  cube.textContent = "DEBUG";

  cube.style.cssText = `
    width: 200px;
    height: 200px;
    background: red;
    color: white;
    font-size: 32px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 999999;
    margin: 20px;
  `;

  // just add that cube to body
  document.body.appendChild(cube);

  console.log("[DEBUG] red cube injected");
}

function addPhotosButton(anchor) {
  if (!anchor || document.getElementById("uploadBtn2")) return;
  
  injectMyFont();

  const btn = document.createElement("button");
  btn.id = "uploadBtn2";
  btn.type = "button";
  btn.textContent = "Upload photos";

  btn.style.cssText = `
    margin-left: 12px;
    padding: 8px 14px;
    background: green;
    color: white;
    font-family: "MyFont", sans-serif;
    font-size: 14px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    white-space: nowrap;
    z-index: 999999;
    position: relative;
  `;

  // 🔑 IMPORTANT CHANGE — do NOT append into parent
  anchor.insertAdjacentElement("afterend", btn);

btn.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  if (!Array.isArray(data?.photos) || data.photos.length === 0) {
    console.error("[BAZOS] no photos in data.photos");
    return;
  }

  // wait for Dropzone hidden input
  let input;
  for (let i = 0; i < 30; i++) {
    input = document.querySelector('input[type="file"].dz-hidden-input');
    if (input) break;
    await new Promise(r => setTimeout(r, 50));
  }

  if (!input) {
    console.error("[BAZOS] Dropzone hidden input not found");
    return;
  }

  const dt = new DataTransfer();

  data.photos.slice(0, 20).forEach((p, i) => {
    let file = null;

    if (p instanceof File) {
      file = p;
    } else if (p instanceof Blob) {
      file = new File([p], `photo_${i}.jpg`, {
        type: p.type || "image/jpeg"
      });
    } else if (typeof p === "string") {
      file = base64ToFile(p, `photo_${i}.jpg`);
    } else if (p?.data && typeof p.data === "string") {
      file = base64ToFile(p.data, p.name || `photo_${i}.jpg`);
    }

    if (file) dt.items.add(file);
  });

  input.files = dt.files;

  // 🔑 THIS triggers Dropzone upload
  input.dispatchEvent(new Event("change", { bubbles: true }));

  console.log("[BAZOS] photos injected:", dt.files.length);
});




  console.log("[BAZOS] upload button injected");
}

// ======================================================
// PHONE VERIFICATION PAGE
// ======================================================
function fillPhoneVerification(phone) {
  if (sessionStorage.getItem("phoneVerifiedOnce")) return;

  waitForElement(
    () => document.querySelector("#teloverit"),
    (el) => setValue(el, phone),
  );

  waitForElement(
    () => document.querySelector("#podminky"),
    (el) => (el.checked = true),
  );

  waitForElement(
    () =>
      document.querySelector('form[name="formovereni"] input[type="submit"]'),
    (btn) => {
      btn.click();
      sessionStorage.setItem("phoneVerifiedOnce", "1");
    },
  );
}

// ======================================================
// MAIN FORM DETECTION
// ======================================================
function isMainFormActive() {
  return (
    document.querySelector("#nadpis") &&
    document.querySelector("#popis") &&
    document.querySelector("#cena") &&
    document.querySelector("#lokalita") &&
    document.querySelector("#jmeno") &&
    document.querySelector("#telefoni") &&
    document.querySelector("#heslobazar")
  );
}

// ======================================================
// MAIN FORM FILL (NO NAVIGATION ELEMENTS)
// ======================================================
function fillMainForm() {
  if (!data || !isMainFormActive()) return;

  setValue(document.getElementById("nadpis"), data.title);
  setValue(document.getElementById("popis"), data.description);
  setValue(document.getElementById("cena"), data.price);
  setValue(document.getElementById("lokalita"), data.postal);
  setValue(document.getElementById("jmeno"), data.name || "");
  setValue(document.getElementById("telefoni"), data.phone);
  setValue(document.getElementById("maili"), data.email);
  setValue(document.getElementById("heslobazar"), data.password);

  const priceType = document.querySelector("#cenavyber");

  setValue(priceType, String(priceTypeMap[data.priceType] || ""));

  console.log("[BAZOS] main form filled");
}

// ======================================================
// CATEGORY (RUBRIKA) — SET ONCE, NAVIGATION CONTROL
// ======================================================
function setCategoryOnce() {
  chrome.storage.local.get(["bazosData", "categorySet"], (res) => {
    if (res.categorySet) return;

    data = res.bazosData;
    if (!data) return;

    const select = document.querySelector("select[name='rubrikyvybrat']");
    if (!select) return;

    // this triggers form.submit() → page reload (EXPECTED)
    setValue(select, String(data.category));

    chrome.storage.local.set({ categorySet: true });
  });
}

// ======================================================
// INIT — RUN ON EVERY LOAD
// ======================================================
function init() {
  if (!data) return;
  waitForElement(
  () => document.querySelector("#uploadbutton"),
  (el) => addPhotosButton(el)
);
  // phone verification
  if (document.querySelector("#teloverit")) {
    fillPhoneVerification(data.phone);
    return;
  }

  // category navigation (runs once)
  setCategoryOnce();

  // main form
  if (isMainFormActive()) {
    fillMainForm();
  }
}

// ======================================================
// ENTRY POINT
// ======================================================

// restore data on reload
chrome.storage.local.get("bazosData", (res) => {
  data = res.bazosData;
  init();
  
});

// receive fresh data
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "fillBazosForm") return;

  data = msg.payload;

  // reset one-time navigation flags for new listing
  chrome.storage.local.set({
    bazosData: msg.payload,
    categorySet: false,
  });

  init();
});
