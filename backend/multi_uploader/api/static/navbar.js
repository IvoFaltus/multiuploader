document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header1");
  const navbar = document.querySelector(".navbarD");

  if (!header || !navbar) {
    return;
  }

  const routes = {
    btnD1: "/guide/",
    btnD2: "/statistics/",
    btnD3: "/settings/",
    btnD4: "/deepweb/"
  };

  const mobileQuery = window.matchMedia("(max-width: 760px)");
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "navbarToggle";
  toggle.setAttribute("aria-label", "Toggle navigation");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = "<span></span><span></span><span></span>";
  header.appendChild(toggle);

  const closeMenu = () => {
    header.classList.remove("navbar-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    if (!mobileQuery.matches) {
      return;
    }

    header.classList.add("navbar-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  const toggleMenu = () => {
    if (header.classList.contains("navbar-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const navButtons = Array.from(navbar.querySelectorAll(".btnD"));

  navButtons.forEach((btn) => {
    const key = Array.from(btn.classList).find((className) => /^btnD\d$/.test(className));
    const route = key ? routes[key] : null;

    if (localStorage["selected"] === key) {
      btn.classList.add("selectedPage");
    }

    btn.addEventListener("click", () => {
      navButtons.forEach((item) => item.classList.remove("selectedPage"));
      btn.classList.add("selectedPage");

      if (key) {
        localStorage["selected"] = key;
      }

      closeMenu();

      if (route && window.location.pathname !== route) {
        window.location.href = route;
      }
    });
  });

  const syncDesktopParent = header;

  const placeSyncButton = () => {
    const syncBtn = document.getElementById("sync");

    if (!syncBtn) {
      return;
    }

    syncBtn.type = "button";
    syncBtn.classList.add("navbarSyncBtn");

    if (mobileQuery.matches) {
      if (syncBtn.parentElement !== navbar) {
        navbar.appendChild(syncBtn);
      }
    } else if (syncBtn.parentElement !== syncDesktopParent) {
      syncDesktopParent.appendChild(syncBtn);
    }
  };

  toggle.addEventListener("click", toggleMenu);

  document.addEventListener("click", (event) => {
    if (!mobileQuery.matches || !header.classList.contains("navbar-open")) {
      return;
    }

    if (!header.contains(event.target)) {
      closeMenu();
    }
  });

  mobileQuery.addEventListener("change", () => {
    placeSyncButton();

    if (!mobileQuery.matches) {
      closeMenu();
    }
  });

  const observer = new MutationObserver(() => {
    placeSyncButton();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  placeSyncButton();
});
