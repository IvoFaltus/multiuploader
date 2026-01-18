// * FULLY FIXED (NULL-SAFE, STEP-BY-STEP)
// * Uses MutationObserver + Angular-safe input setters

// ======================================================
// #region GLOBAL STATE
// ======================================================
let data = null;
// #endregion



// ======================================================
// #region UTIL — DOM WATCHERS
// ======================================================

// ? Watches a parent element and hides/shows label based on fill state
function watchFilledParent(parent, isFilledFn, label) {
  if (!parent || !label) return;

  const check = () => {
    label.style.display = isFilledFn() ? "none" : "block";
  };

  const observer = new MutationObserver(check);
  observer.observe(parent, {
    subtree: true,
    childList: true,
    characterData: true,
  });

  check(); // initial state
}
// #endregion



// ======================================================
// #region UTIL — FILE / BASE64 HELPERS
// ======================================================
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
// #endregion



// ======================================================
// #region UI — VALIDATION LABELS
// ======================================================

// ? Adds red warning label next to target section
function addLabel(target, text) {
  if (!target) return null;

  // ensure parent can anchor absolutely positioned label
  const parent = target.parentElement;
  if (getComputedStyle(parent).position === "static") {
    parent.style.position = "relative";
  }

  const label = document.createElement("div");
  label.textContent = text;
  label.style.cssText = `
    position:absolute;
    top:50%;
    left:100%;
    margin-left:8px;
    transform:translateY(-50%);
    color:red;
    font-size:12px;
    font-weight:600;
    white-space:nowrap;
    pointer-events:none;
  `;

  target.insertAdjacentElement("afterend", label);
  return label;
}
// #endregion



// ======================================================
// #region UI — FONT INJECTION
// ======================================================
function injectMyFont() {
  if (document.getElementById("myfont-style")) return;

  const style = document.createElement("style");
  style.id = "myfont-style";
  style.textContent = `
    @font-face {
      font-family: "MyFont";
      src: url("${chrome.runtime.getURL(
        "fonts/GreaterTheory.otf"
      )}") format("opentype");
      font-weight: normal;
      font-style: normal;
    }
  `;
  document.head.appendChild(style);
}
// #endregion



// ======================================================
// #region UI — PHOTO UPLOAD BUTTON
// ======================================================
function addPhotosButton(anchor) {
  if (!anchor || document.getElementById("uploadBtn")) return;

  injectMyFont();

  const btn = document.createElement("button");
  btn.id = "uploadBtn";
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
    z-index: 9999;
    box-shadow: 0 4px 6px rgba(2,2,2,0.5);
    pointer-events: auto;
  `;

  // append OUTSIDE any <label>
  const safeParent =
    anchor.closest("label")?.parentElement ?? anchor.parentElement;
  safeParent.appendChild(btn);

  // ✅ correct upload: inject files ONLY
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (!data || !Array.isArray(data.photos) || !data.photos.length) {
      console.error("[AUKRO] no photos in data.photos");
      return;
    }

    // find existing file input created by Aukro
    let input;
    for (let i = 0; i < 50; i++) {
      input = document.querySelector('input[type="file"]');
      if (input) break;
      await new Promise((r) => setTimeout(r, 100));
    }

    if (!input) {
      console.error("[AUKRO] file input not found");
      return;
    }

    const files = data.photos.map((p, i) => {
      if (p instanceof File) return p;
      if (p instanceof Blob)
        return new File([p], `photo_${i}.jpg`, { type: p.type });

      if (typeof p === "string") {
        return base64ToFile(p, `photo_${i}.jpg`);
      }

      if (p?.data && typeof p.data === "string") {
        return base64ToFile(p.data, p.name || `photo_${i}.jpg`);
      }

      throw new Error("Unsupported photo format");
    });

    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));

    input.files = dt.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));

    console.log("[AUKRO] photos injected:", files.length);
  });

  console.log("[AUKRO] upload button injected");
}
// #endregion



// ======================================================
// #region ENTRY POINT — MESSAGE FROM EXTENSION
// ======================================================
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "fillAukroForm") return;
  console.log("[AUKRO] fillAukroForm message received");
  data = msg.payload; // make accessible for button handler

  // ----------------------------------------------
  // Wait for photos header (Angular async render)
  // ----------------------------------------------
  const waitForPhotosHeader = () => {
    const anchor = document.querySelector(".images-header-button");
    if (!anchor) {
      requestAnimationFrame(waitForPhotosHeader);
      return;
    }
    addPhotosButton(anchor);
  };
  waitForPhotosHeader();

  // ----------------------------------------------
  // Angular-safe matInput setter
  // ----------------------------------------------
  function setMatInput(el, value) {
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

  // ----------------------------------------------
  // Filled-state guards
  // ----------------------------------------------
  const filled = {
    title: false,
    desc: false,
    account: false,
    price: false,
    saleType: false,
  };

  // ----------------------------------------------
  // Main polling loop (Angular DOM is async)
  // ----------------------------------------------
  const wait = setInterval(() => {
    // ---------- TARGET SECTIONS ----------
    const shippingSection = document.querySelector(
      "mat-expansion-panel:has(div.tw-text-xl)"
    );

    const categorySection = document
      .querySelector("#category-id")
      ?.closest("mat-expansion-panel");

    // ---------- LABELS ----------
    const shippingLabel = addLabel(
      shippingSection,
      "Don't forget to add shipping"
    );
    const categoryLabel = addLabel(categorySection, "Category required");

    // ---------- WATCHERS ----------
    watchFilledParent(
      shippingSection,
      () =>
        shippingSection?.querySelectorAll(
          "auk-shipping-select, auk-shipping-price-list-select"
        ).length > 0,
      shippingLabel
    );

    watchFilledParent(
      categorySection,
      () => !categorySection?.innerText.includes("Vyberte kategorii"),
      categoryLabel
    );

    // ---------- INPUTS ----------
    const title = document.querySelector('input[name="name"]');
    const desc = document.querySelector('textarea[name="description"]');

    const accountField = Array.from(
      document.querySelectorAll("mat-form-field")
    ).find((f) => f.innerText.toLowerCase().includes("účtu"));

    const accountNum = accountField
      ? accountField.querySelector("input.mat-mdc-input-element")
      : null;

    const buyNowPrice = document.querySelector(
      'input[matinput][name="buy-now-price"]'
    );
    const auctionPrice = document.querySelector(
      'input[matinput][name="starting-price"]'
    );

    const toggleButtons = [
      ...document.querySelectorAll(
        'button[auktestidentification="auk-button"]'
      ),
    ];

    // ---------- SALE TYPE ----------
    if (!filled.saleType && toggleButtons.length >= 2) {
      const isBuyNow = data.saleType === "buy_now";
      const targetText = isBuyNow ? "Kup teď" : "Aukce";

      toggleButtons.find((b) => b.innerText.trim() === targetText)?.click();
      filled.saleType = true;
    }

    // ---------- TITLE ----------
    if (!filled.title && title && data.title) {
      setMatInput(title, data.title);
      filled.title = true;
    }

    // ---------- BANK ACCOUNT ----------
    if (!filled.account && accountNum && data.bankAccount) {
      setMatInput(accountNum, data.bankAccount);
      filled.account = true;
    }

    // ---------- DESCRIPTION ----------
    if (!filled.desc && desc && data.description) {
      desc.value = data.description;
      desc.dispatchEvent(new Event("input", { bubbles: true }));
      filled.desc = true;
    }

    // ---------- PRICE ----------
    if (!filled.price && data.price) {
      if (data.saleType === "buy_now" && buyNowPrice) {
        buyNowPrice.value = data.price;
        buyNowPrice.dispatchEvent(new Event("input", { bubbles: true }));
        filled.price = true;
      }

      if (data.saleType !== "buy_now" && auctionPrice) {
        auctionPrice.value = data.price;
        auctionPrice.dispatchEvent(new Event("input", { bubbles: true }));
        filled.price = true;
      }
    }

    // ---------- FINISH ----------
    if (
      filled.title &&
      filled.desc &&
      filled.account &&
      filled.price &&
      filled.saleType
    ) {
      clearInterval(wait);
    }
  }, 300);
});
// #endregion
