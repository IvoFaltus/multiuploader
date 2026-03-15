import {
  BACKGROUND_TRANSITION_MS,
  backgrounds,
  fadeToBackgroundRight,
} from "./script.js";
let currentPage = "page-home";
let isSwitching = false;
let switchCleanupTimer = null;
const PAGE_TRANSITION_MS = BACKGROUND_TRANSITION_MS;
// ======================================================
// PAGE SWITCH (NO CSS ANIMATION LOGIC)
// ======================================================
const fadeToBackgroundForPage = (pageClass, bgIndex) => {
  const texture = backgrounds?.[bgIndex];
  if (!texture) {
    return;
  }

  fadeToBackgroundRight(texture);
};

const resetPageTransitionState = (page) => {
  if (!page) return;
  page.style.transition = "";
  page.style.transform = "";
  page.style.opacity = "";
  page.classList.remove("animatedOff", "entered", "enteredhelper");
};

const switchToPage = (pageClass, bgIndex) => {
  if (pageClass === currentPage || isSwitching) return;

  fadeToBackgroundForPage(pageClass, bgIndex);

  const oldPage = document.querySelector(`.${currentPage}`);
  const nextPage = document.querySelector(`.${pageClass}`);
  if (!nextPage) return;

  isSwitching = true;

  if (switchCleanupTimer) {
    clearTimeout(switchCleanupTimer);
    switchCleanupTimer = null;
  }

  resetPageTransitionState(oldPage);
  resetPageTransitionState(nextPage);

  nextPage.classList.remove("hidden");
  nextPage.style.transition = "none";
  nextPage.style.transform = "translateX(100vw)";
  nextPage.style.opacity = "1";

  if (oldPage) {
    oldPage.classList.remove("hidden");
    oldPage.style.transition = "none";
    oldPage.style.transform = "translateX(0)";
    oldPage.style.opacity = "1";
  }

  nextPage.getBoundingClientRect();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const transitionValue =
        `transform ${PAGE_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${Math.round(PAGE_TRANSITION_MS * 0.72)}ms ease`;

      nextPage.style.transition = transitionValue;
      nextPage.style.transform = "translateX(0)";

      if (oldPage) {
        oldPage.style.transition = transitionValue;
        oldPage.style.transform = "translateX(100vw)";
        oldPage.style.opacity = "0";
      }
    });
  });

  switchCleanupTimer = setTimeout(() => {
    if (oldPage) {
      oldPage.classList.add("hidden");
      resetPageTransitionState(oldPage);
    }

    resetPageTransitionState(nextPage);
    currentPage = pageClass;
    isSwitching = false;
    switchCleanupTimer = null;
  }, PAGE_TRANSITION_MS + 60);
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
  ?.addEventListener("click", () => switchToPage("page-about", 0));

document
  .getElementById("Contact")
  ?.addEventListener("click", () => switchToPage("page-contact", 0));

document
  .getElementById("Home")
  ?.addEventListener("click", () => switchToPage("page-home", 0));

document
  .getElementById("Login")
  ?.addEventListener("click", () => switchToPage("page-login", 0));

document
  .getElementById("Register")
  ?.addEventListener("click", () => switchToPage("page-register", 0));
