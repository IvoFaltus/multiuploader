// ===== DEBUG UTILS =====
const DBG = (...args) => console.log("[SBAZAR DEBUG]", ...args);
const ERR = (...args) => console.error("[SBAZAR ERROR]", ...args);

// ===== helpers =====
function setInput(input, value) {
  DBG("setInput called", { input, value });

  if (!input) {
    ERR("setInput: input not found");
    return;
  }

  try {
    input.focus();
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    DBG("setInput success", input, value);
  } catch (e) {
    ERR("setInput failed", e);
    throw e;
  }
}

// React/Vue controlled inputs fallback
function setReactInput(input, value) {
  DBG("setReactInput called", { input, value });

  if (!input) {
    ERR("setReactInput: input not found");
    return;
  }

  try {
    const setter = Object.getOwnPropertyDescriptor(input.__proto__, "value").set;
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    DBG("setReactInput success", input, value);
  } catch (e) {
    ERR("setReactInput failed", e);
  }
}

// choose which setter to use
function fill(input, value) {
  DBG("fill()", { input, value });

  if (!input) {
    ERR("fill: input is null");
    return;
  }

  try {
    setInput(input, value);
  } catch (e) {
    DBG("fallback to React setter");
    setReactInput(input, value);
  }
}

// ===== main =====
let data = null;

function init() {
  DBG("init() called");

  if (!data) {
    ERR("init: data is null");
    return;
  }

  DBG("payload data:", data);

  const nazev = data.title;
  const popis = data.description;
  const jmeno = data.name;
  const kategorie = data.category;
  const cena_typ = data.priceType;
  const lokalita = data.city;
  const price = data.price;
  const phoneNumber = data.phone;
  const displayPhone = data.displayPhone;

  DBG("parsed values:", {
    nazev,
    popis,
    jmeno,
    kategorie,
    cena_typ,
    lokalita,
    price,
    phoneNumber,
    displayPhone,
  });

  const titleInput = document.querySelector("#P0-0");
  const descriptionInput = document.querySelector("#P0-1");
  const localInput = document.querySelector(
    "body > div.flex.flex-col > div.grow.flex.justify-center > div > div.flex.justify-center.mb-12 > div > main > astro-island > div > div:nth-child(2) > form > div:nth-child(4) > div.relative > div > div > div.relative.h-full > input"
  );
  const priceInput = document.querySelector("#input-price")
  const phoneInput = document.querySelector("#P0-3");

  const checkBoxCenaDohodou = document.querySelector(
    "body > div.flex.flex-col > div.grow.flex.justify-center > div > div.flex.justify-center.mb-12 > div > main > astro-island > div > div:nth-child(2) > form > div:nth-child(5) > div.flex.md\\:items-center.flex-col.md\\:flex-row.gap-6.relative > label:nth-child(2) > span.relative.w-\\[18px\\].h-\\[18px\\].shrink-0 > input"
  );

  const checkBoxCenaZdarma = document.querySelector(
    "body > div.flex.flex-col > div.grow.flex.justify-center > div > div.flex.justify-center.mb-12 > div > main > astro-island > div > div:nth-child(2) > form > div:nth-child(5) > div.flex.md\\:items-center.flex-col.md\\:flex-row.gap-6.relative > label:nth-child(3) > span.relative.w-\\[18px\\].h-\\[18px\\].shrink-0 > input"
  );

  const agreeTerms = document.querySelector(
    "body > div.flex.flex-col > div.grow.flex.justify-center > div > div.flex.justify-center.mb-12 > div > main > astro-island > div > div:nth-child(2) > form > div.mb-8.mt-4.relative.rounded-full.px-4.py-2.border.border-solid.border-transparent > label > span.relative.w-\\[18px\\].h-\\[18px\\].shrink-0 > input"
  );

  DBG("selectors result:", {
    titleInput,
    descriptionInput,
    localInput,
    priceInput,
    phoneInput,
    checkBoxCenaDohodou,
    checkBoxCenaZdarma,
    agreeTerms,
  });

  // ===== fill inputs =====
  DBG("filling inputs...");
  fill(titleInput, nazev);
  fill(descriptionInput, popis);
  fill(localInput, lokalita);
  fill(priceInput, price);
  fill(phoneInput, phoneNumber);

  // ===== price type =====
  DBG("price type:", cena_typ);

  if (cena_typ === "dohodou") {
    if (checkBoxCenaDohodou) {
      checkBoxCenaDohodou.checked = true;
      checkBoxCenaDohodou.dispatchEvent(new Event("change", { bubbles: true }));
      DBG("checked: cena dohodou");
    } else {
      ERR("checkbox cena dohodou not found");
    }
  }

  if (cena_typ === "zdarma") {
    if (checkBoxCenaZdarma) {
      checkBoxCenaZdarma.checked = true;
      checkBoxCenaZdarma.dispatchEvent(new Event("change", { bubbles: true }));
      DBG("checked: zdarma");
    } else {
      ERR("checkbox zdarma not found");
    }
  }

  // ===== terms =====
  if (agreeTerms) {
    agreeTerms.checked = true;
    agreeTerms.dispatchEvent(new Event("change", { bubbles: true }));
    DBG("terms accepted");
  } else {
    ERR("terms checkbox not found");
  }

  DBG("Sbazar form filled DONE");
}

chrome.runtime.onMessage.addListener((msg) => {
  DBG("message received:", msg);

  if (msg.action !== "fillSbazarForm") {
    DBG("ignored message:", msg.action);
    return;
  }

  data = msg.payload;

  DBG("payload stored:", data);

  chrome.storage.local.set({
    sbazarData: msg.payload,
  });

  init();
});