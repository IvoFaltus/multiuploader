let initialized = false

let selected = false

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






function addPhotosButton(anchor, data) {
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

    // find the real facebook upload input
    let input;
    for (let i = 0; i < 40; i++) {
      input = document.querySelector('input[type="file"][multiple]');
      if (input) break;
      await new Promise(r => setTimeout(r, 50));
    }

    if (!input) {
      console.error("[BAZOS] upload input not found");
      return;
    }

    const files = [];

    for (let i = 0; i < Math.min(data.photos.length, 20); i++) {
      const p = data.photos[i];
      let file = null;

      if (p instanceof File) {
        file = p;
      }
      else if (p instanceof Blob) {
        file = new File([p], `photo_${i}.jpg`, { type: p.type || "image/jpeg" });
      }
      else if (typeof p === "string") {
        file = base64ToFile(p, `photo_${i}.jpg`);
      }
      else if (p?.data && typeof p.data === "string") {
        file = base64ToFile(p.data, p.name || `photo_${i}.jpg`);
      }

      if (file) files.push(file);
    }

    if (!files.length) {
      console.error("[BAZOS] no valid files created");
      return;
    }

    const dt = new DataTransfer();
    files.forEach(f => dt.items.add(f));

    input.files = dt.files;

    // trigger facebook/react upload pipeline
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    console.log("[BAZOS] photos injected:", dt.files.length);
  });




  console.log("[BAZOS] upload button injected");
}

















const setReactInput = (el, value) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  ).set

  setter.call(el, value)

  el.dispatchEvent(new Event("input", { bubbles: true }))
  el.dispatchEvent(new Event("change", { bubbles: true }))
}

const setReactTextarea = (el, value) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value"
  ).set

  setter.call(el, value)

  el.dispatchEvent(new Event("input", { bubbles: true }))
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function selectFacebookCondition(conditionTrigger, rawValue) {
  const wanted = (rawValue || "").trim().toLowerCase()
  if (!conditionTrigger || !wanted) return false

  conditionTrigger.click()

  for (let attempt = 0; attempt < 20; attempt++) {
    const option = [...document.querySelectorAll('[role="option"]')]
      .find((el) => (el.textContent || "").trim().toLowerCase().includes(wanted))

    if (option) {
      option.click()
      return true
    }

    await wait(150)
  }

  return false
}

const init = (data) => {
  if (!data) {
    console.log("payload missing")
    return
  }

  console.log("init before")
  if (initialized) return
  initialized = true
  console.log("init")











  const i = setInterval(async () => {

    const title = [...document.querySelectorAll('span')]
      .find(e => e.textContent.trim() === 'Název')
      ?.closest('label')
      ?.querySelector('input')

    const price = [...document.querySelectorAll('span')]
      .find(e => e.textContent.trim() === 'Cena')
      ?.closest('label')
      ?.querySelector('input')

    const desc = [...document.querySelectorAll('span')]
      .find(e => e.textContent.trim() === 'Popis')
      ?.closest('label')
      ?.querySelector('textarea')
    const lokalita = [...document.querySelectorAll('span')]
      .find(e => e.textContent.trim() === 'Lokalita')
      ?.closest('label')
      ?.querySelector('textarea')

    const email = document.querySelector('input[type="email"]')

    const photos = document.querySelector('input[type="file"][multiple]')

    const condition = [...document.querySelectorAll('span')]
      .find(e => e.textContent.trim() === 'Stav')
      ?.closest('[role="combobox"]')

    if (title && data.title) setReactInput(title, data.title)
    if (price && data.price) setReactInput(price, data.price)
    if (desc && data.description) setReactTextarea(desc, data.description)
    if (email && data.email) setReactInput(email, data.email)
    if (condition && data.condition && !selected) {
      const wasSelected = await selectFacebookCondition(condition, data.condition)
      console.log("condition selected:", wasSelected, data.condition)
      selected = wasSelected
    }
    if (lokalita && data.city) setReactInput(lokalita, data.city)
    
    if (!title) console.log("title not found")
    if (!price) console.log("price not found")
    if (!desc) console.log("description not found")
    if (!email) console.log("email not found")
    if (!photos) console.log("photos not found")
    if (!condition) console.log("condition not found")
    console.log(data.condition)
    console.log("try")

    if (
      title?.value === data.title &&
      desc?.value === data.description

    ) {
      clearInterval(i)

      setTimeout(() => clearInterval(i), 3000)
    }
    addPhotosButton(photos, data)
  }, 1000)



}


chrome.runtime.onMessage.addListener((msg) => {
  console.log("msg:" + msg)
  if (msg.action !== "syncFacebook") return

  let i = 0

  const timer = setInterval(() => {
    console.log(i + " debug")

    const span = [...document.querySelectorAll("span")]
      .find(el =>
        el.textContent.trim() === "Věc na prodej" ||
        el.textContent.trim() === "Item for sale"
      );

    const btn = span?.closest('[role="button"]');

    if (btn) {
      btn.click();
      console.log("redirect clicked");
    }

    if (i > 30) clearInterval(timer)
    i++
  }, 100)


  const observer = new MutationObserver(() => {

    const el1 = [...document.querySelectorAll('span')]
      .find(e => e.textContent.trim() === 'Název')
      ?.closest('label')
      ?.querySelector('input')

    if (el1) {
      observer.disconnect()
      init(msg.payload)
    }

  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
})
