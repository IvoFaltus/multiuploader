// ======================================================
// BAZOS CONTENT SCRIPT — FINAL FIXED VERSION
// ======================================================

// ======================================================
// #region GLOBAL STATE
// ======================================================
let data = null;
let smsVerified = false;
// #endregion

// ======================================================
// #region GLOBAL CLICK HELPER (SHARED)
// ======================================================
function humanClick(el) {
  if (!el) return false;
  el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  return true;
}
// #endregion
function clickAutoAndPridatUntilPhone(onSuccess) {
  
    // SUCCESS condition
    if (document.querySelector("input#teloverit")) {
      clearInterval(t);
      console.log("[BAZOS] phone input detected, navigation unlocked");
      onSuccess?.(); // 👈 continue normal logic
      return;
    }

    const auto = document.querySelector('body > div > div.listalogor > div.listalogop > a:nth-child(3)');
    const add = document.querySelector('a[href="/pridat-inzerat.php"]');

    if (auto) {
      humanClick(auto);
      console.log("[BAZOS] Auto clicked");
    }
    
    
  
}

// ======================================================
// #region BAZOS NAVIGATION FLOW
// ======================================================
function clickAuto(cb) {
  const t = setInterval(() => {
    const auto = document.querySelector('a[href="https://auto.bazos.cz/"]');
    if (!auto) return;

    humanClick(auto);
    clearInterval(t);
    console.log("[BAZOS] Auto clicked");
    cb?.();
  }, 200);
}

function clickPridatInzerat() {
  const t = setInterval(() => {
    const add = document.querySelector('a[href="/pridat-inzerat.php"]');
    if (!add) return;

    humanClick(add);
    clearInterval(t);
    console.log("[BAZOS] Přidat inzerát clicked");
  }, 200);
}
// #endregion

// ======================================================
// #region UTIL — WAIT
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
// #endregion

// ======================================================
// #region UTIL — MAPPERS
// ======================================================
function mapRubrikaToBazos(value) {
  switch (value) {
    case "dum_a_zahrada":
      return "dum";
    case "mobily":
      return "mobil";
    default:
      return value || "";
  }
}

function mapPriceTypeToBazos(value) {
  switch (value) {
    case "dohodou":
      return "2";
    case "nabidnete":
      return "3";
    case "nerozhoduje":
      return "4";
    case "v_textu":
      return "5";
    case "zdarma":
      return "6";
    default:
      return "1";
  }
}
// #endregion

// ======================================================
// #region SAFE INPUT SETTER
// ======================================================
function setInputValue(el, value) {
  if (!el) return;

  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  ).set;

  el.focus();
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.blur();
}
// #endregion

// ======================================================
// #region SMS VERIFICATION
// ======================================================
function detectSmsVerified() {
  return !document.getElementById("klic");
}

function waitForSmsVerification(cb) {
  const t = setInterval(() => {
    if (detectSmsVerified()) {
      clearInterval(t);
      smsVerified = true;
      cb();
    }
  }, 300);
}
// #endregion

// ======================================================
// #region MAIN FORM FILL
// ======================================================
function fillMainForm() {
  if (!smsVerified || !data) return;

  setInputValue(document.getElementById("nadpis"), data.title);
  setInputValue(document.getElementById("popis"), data.description);
  setInputValue(document.getElementById("cena"), data.price);
  setInputValue(
    document.getElementById("cenavyber"),
    mapPriceTypeToBazos(data.priceType),
  );
  setInputValue(document.getElementById("lokalita"), data.postal);
  setInputValue(
    document.querySelector('select[name="rubrikyvybrat"]'),
    mapRubrikaToBazos(data.category),
  );

  setInputValue(document.getElementById("jmeno"), data.name || "");
  setInputValue(document.getElementById("telefoni"), data.phone);
  setInputValue(document.getElementById("maili"), data.email);
  setInputValue(document.getElementById("heslobazar"), data.password);

  console.log("[BAZOS] main form filled");
}
// #endregion

// ======================================================
// #region PHONE + SUBMIT
// ======================================================
function fillnumber(phone) {
  waitForElement(
    () => document.querySelector('input[name="teloverit"]'),
    (el) => setInputValue(el, phone),
  );

  waitForElement(
    () => document.querySelector("#podminky"),
    (btn) => (btn.checked = true),
  );

  waitForElement(
    () => document.querySelector('input[type="submit"][name="Submit"]'),
    (btn) => btn.click(),
  );
}
// #endregion

// ======================================================
// #region ENTRY POINT
// ======================================================
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "fillBazosForm") return;
  data = msg.payload;
  clickAutoAndPridatUntilPhone(() => {
    fillnumber(data.phone);

    waitForSmsVerification(() => {
      fillMainForm();
    });
  });
});
// #endregion
