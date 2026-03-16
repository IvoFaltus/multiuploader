document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".global-nav");
  if (!nav) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 900px)");

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "globalNavToggle";
  toggle.setAttribute("aria-label", "Toggle navigation");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = "<span></span><span></span><span></span>";
  document.body.appendChild(toggle);

  const closeNav = () => {
    nav.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const openNav = () => {
    nav.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  const applyLayout = () => {
    if (mobileQuery.matches) {
      toggle.hidden = false;
      closeNav();
    } else {
      toggle.hidden = true;
      nav.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "true");
    }
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    if (nav.classList.contains("nav-open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  nav.addEventListener("click", (event) => {
    // Don't close when tapping inside the open panel.
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    if (!mobileQuery.matches) {
      return;
    }
    closeNav();
  });

  // Close after selecting a page.
  nav.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      if (mobileQuery.matches) {
        closeNav();
      }
    });
  });

  mobileQuery.addEventListener("change", applyLayout);
  applyLayout();
});
