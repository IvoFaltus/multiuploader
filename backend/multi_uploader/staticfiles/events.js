import { backgrounds, fadeToBackground } from "./script.js";
let currentPage = "page-home";
// ======================================================
// PAGE SWITCH (NO CSS ANIMATION LOGIC)
// ======================================================
const switchToPage = (pageClass, bgIndex) => {
  if (pageClass === currentPage) return;

  if (backgrounds?.[bgIndex]) {
    fadeToBackground(backgrounds[bgIndex]);
  }

  const oldPage = document.querySelector(`.${currentPage}`);
  const nextPage = document.querySelector(`.${pageClass}`);
  if (!nextPage) return;

  // ----- RESET NEXT PAGE -----
  nextPage.classList.remove("hidden", "animatedOff", "entered");
  nextPage.classList.add("enteredhelper");

  // force reflow (CRITICAL)
  nextPage.getBoundingClientRect();

  // ----- START ENTER -----
  nextPage.classList.add("entered");

  // ----- EXIT OLD PAGE -----
  if (oldPage) {
    oldPage.classList.remove("enteredhelper");
    oldPage.classList.add("animatedOff");

    const onExitEnd = (e) => {
      if (e.propertyName !== "transform") return;
      oldPage.classList.add("hidden");
      oldPage.classList.remove("animatedOff", "entered");
      oldPage.removeEventListener("transitionend", onExitEnd);
    };

    oldPage.addEventListener("transitionend", onExitEnd);
  }

  // ----- CLEANUP ENTER -----
  const onEnterEnd = (e) => {
    if (e.propertyName !== "transform") return;
    nextPage.classList.remove("enteredhelper");
    nextPage.removeEventListener("transitionend", onEnterEnd);
  };

  nextPage.addEventListener("transitionend", onEnterEnd);

  currentPage = pageClass;
};

// ======================================================
// FINAL PAGE VISIBILITY SWITCH
// ======================================================
const finishSwitch = (pageClass) => {
  
  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));

  const page = document.querySelector(`.${pageClass}`);
  if (page) page.classList.remove("hidden");
};

// ======================================================
// NAV BUTTONS
// ======================================================
document
  .getElementById("About")
  ?.addEventListener("click", () => switchToPage("page-about", 1));

document
  .getElementById("Contact")
  ?.addEventListener("click", () => switchToPage("page-contact", 2));

document
  .getElementById("Home")
  ?.addEventListener("click", () => switchToPage("page-home", 0));

document
  .getElementById("Login")
  ?.addEventListener("click", () => switchToPage("page-login", 3));

document
  .getElementById("Register")
  ?.addEventListener("click", () => switchToPage("page-register", 4));
