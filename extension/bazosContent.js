// ======================================================
// BAZOS CONTENT SCRIPT — SKELETON / LAYOUT
// ======================================================

// ======================================================
// #region GLOBAL STATE
// ======================================================
let data = null;
let smsVerified = false;
// #endregion



// ======================================================
// #region UTIL — WAIT / OBSERVE
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

function observeDom(target, onChange) {
  if (!target) return;
  const obs = new MutationObserver(onChange);
  obs.observe(target, { childList: true, subtree: true });
  return obs;
}
// #endregion



// ======================================================
// #region UTIL — SAFE INPUT SETTER
// ======================================================
function setInputValue(el, value) {
  if (!el) return;

  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  ).set;

  el.focus();
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.blur();
}
// #endregion



// ======================================================
// #region STEP 1 — PHONE + SUBMIT
// ======================================================
function fillPhoneAndSubmit() {
  // TODO: find phone input
  // TODO: set phone number

  // TODO: find submit button
  // TODO: click submit
}
// #endregion



// ======================================================
// #region STEP 2 — SMS VERIFICATION DETECTION
// ======================================================
function detectSmsVerified() {
  // possible strategies:
  // - SMS input disappears
  // - main form appears
  // - URL changes
  // - submit button text changes

  // placeholder condition
  return false;
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
// #region STEP 3 — MAIN FORM FILL
// ======================================================
function fillMainForm() {
  if (!smsVerified || !data) return;

  // TODO: title
  // setInputValue(titleEl, data.title);

  // TODO: description
  // TODO: price
  // TODO: category
  // TODO: location
  // TODO: photos (file input)

  console.log("[BAZOS] main form filled");
}
// #endregion



// ======================================================
// #region ENTRY POINT — MESSAGE FROM EXTENSION
// ======================================================
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "fillBazosForm") return;

  data = msg.payload;

  // STEP 1
  fillPhoneAndSubmit();

  // STEP 2
  waitForSmsVerification(() => {
    // STEP 3
    fillMainForm();
  });
});
// #endregion
