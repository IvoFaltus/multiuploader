import { backgrounds, fadeToBackground } from "./script.js";

const HOME_EXIT_CLASS = "slide-out-elliptic-top-bck";
const HOME_EXIT_TIME = 500; // must match CSS (0.5s)

// ======================================================
// PAGE SWITCH (HDRI + animation SAFE)
// ======================================================
const switchToPage = (pageClass, bgIndex) => {
  // background is OPTIONAL
  if (backgrounds?.[bgIndex]) {
    fadeToBackground(backgrounds[bgIndex]);
  }

  const home = document.querySelector(".page-home");

  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;

    home?.classList.remove(HOME_EXIT_CLASS);
    finishSwitch(pageClass);
  };

  // leaving HOME → try animation, but NEVER block logic
  if (home && !home.classList.contains("hidden") && pageClass !== "page-home") {
    home.classList.add(HOME_EXIT_CLASS);

    home.addEventListener("animationend", finish, { once: true });

    // 🔒 fallback if animation never fires
    setTimeout(finish, HOME_EXIT_TIME + 50);
  } else {
    finish();
  }
};

// ======================================================
// FINAL PAGE VISIBILITY SWITCH
// ======================================================
const finishSwitch = (pageClass) => {
  document.querySelectorAll(".page").forEach((p) =>
    p.classList.add("hidden")
  );

  const page = document.querySelector(`.${pageClass}`);
  if (page) page.classList.remove("hidden");
};

// ======================================================
// NAV BUTTONS
// ======================================================
document.getElementById("About")?.addEventListener("click", () =>
  switchToPage("page-about", 1)
);

document.getElementById("Contact")?.addEventListener("click", () =>
  switchToPage("page-contact", 2)
);

document.getElementById("Home")?.addEventListener("click", () =>
  switchToPage("page-home", 0)
);

document.getElementById("Login")?.addEventListener("click", () =>
  switchToPage("page-login", 3)
);

document.getElementById("Register")?.addEventListener("click", () =>
  switchToPage("page-register", 4)
);
