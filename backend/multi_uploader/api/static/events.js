import { backgrounds, fadeToBackground } from "./script.js";

// ======================================================
// PAGE SWITCH (NO CSS ANIMATION LOGIC)
// ======================================================
const switchToPage = (pageClass, bgIndex) => {
  // background is OPTIONAL
  if (backgrounds?.[bgIndex]) {
    fadeToBackground(backgrounds[bgIndex]);
  }

  setTimeout(() => {
    finishSwitch(pageClass);
  }, 700);
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
