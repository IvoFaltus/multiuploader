let cityInput = null
let emailInput = null
let photoInput = null
let titleInput = null
let priceInput = null
let categoryCombo = null
let conditionCombo = null
let descriptionInput = null
let addPhotosBtn = null
let marketplaceForm = null

let initialized = false

const init = () => {
  if (initialized) return
  initialized = true
  console.log("init")

  // CITY
const cityInput =
  document.querySelector('input[aria-label="PSČ nebo město"]') ||
  document.querySelector('label:has(span:contains("PSČ nebo město")) input');

console.log("cityInput:", cityInput ? "FOUND" : "NOT FOUND", cityInput);


// EMAIL
const emailInput =
  document.querySelector('input[type="email"][autocomplete="email"]') ||
  document.querySelector('input[type="email"]');

console.log("emailInput:", emailInput ? "FOUND" : "NOT FOUND", emailInput);


// PHOTOS
const photoInput =
  document.querySelector('input[type="file"][multiple][accept*="image"]');

console.log("photoInput:", photoInput ? "FOUND" : "NOT FOUND", photoInput);


// TITLE
const titleLabel = [...document.querySelectorAll("label span")]
  .find(el => el.textContent.trim() === "Název");

const titleInput = titleLabel?.closest("label")?.querySelector("input");

console.log("titleInput:", titleInput ? "FOUND" : "NOT FOUND", titleInput);


// PRICE
const priceLabel = [...document.querySelectorAll("label span")]
  .find(el => el.textContent.trim() === "Cena");

const priceInput = priceLabel?.closest("label")?.querySelector("input");

console.log("priceInput:", priceInput ? "FOUND" : "NOT FOUND", priceInput);


// CATEGORY
const categoryCombo = [...document.querySelectorAll('[role="combobox"]')]
  .find(el => el.textContent.includes("Kategorie"));

console.log("categoryCombo:", categoryCombo ? "FOUND" : "NOT FOUND", categoryCombo);


// CONDITION
const conditionCombo = [...document.querySelectorAll('[role="combobox"]')]
  .find(el => el.textContent.includes("Stav"));

console.log("conditionCombo:", conditionCombo ? "FOUND" : "NOT FOUND", conditionCombo);


// DESCRIPTION
const descriptionLabel = [...document.querySelectorAll("label span")]
  .find(el => el.textContent.trim() === "Popis");

const descriptionInput =
  descriptionLabel?.closest("label")?.querySelector("textarea") ||
  document.querySelector("textarea");

console.log("descriptionInput:", descriptionInput ? "FOUND" : "NOT FOUND", descriptionInput);


// FORM
const marketplaceForm =
  document.querySelector('[role="form"][aria-label="Marketplace"]') ||
  document.querySelector("form");

console.log("marketplaceForm:", marketplaceForm ? "FOUND" : "NOT FOUND", marketplaceForm);

  console.log("Marketplace page detected")
  
  
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "syncFacebook") return
  const data = msg.payload
  let i = 0

  const timer = setInterval(() => {
    console.log(i)

    const btn = [...document.querySelectorAll("span")].find(
      el =>
        el.textContent?.includes("Vytvořit") ||
        el.textContent?.includes("Create")
    )

    if (btn) {
      btn.closest('[role="none"]')?.click()
      console.log("clicked")
      clearInterval(timer)
    }

    if (i > 30) clearInterval(timer)
    i++
  }, 100)

  const observer = new MutationObserver(() => {

    const el1 = document.querySelector('input[aria-label="PSČ nebo město"]')
    const el2 = document.querySelector("#_r_3u_")
    const el3 = document.querySelector('input[type="file"][multiple]')

    let found = 0
    if (el1) found++
    if (el2) found++
    if (el3) found++

    if (found >= 3) {
      observer.disconnect()
      init()
    }

  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
})