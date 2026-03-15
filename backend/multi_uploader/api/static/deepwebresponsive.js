document.addEventListener("DOMContentLoaded", () => {
  const optionsPanel = document.querySelector(".optionsD");
  const subOptions = document.querySelector(".subOptions");

  if (!optionsPanel || !subOptions) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 900px)");
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "responsiveFiltersToggle";
  toggle.textContent = "Filters and actions";

  const searchInput = optionsPanel.querySelector(".searchListing");
  if (searchInput) {
    searchInput.insertAdjacentElement("afterend", toggle);
  } else {
    optionsPanel.prepend(toggle);
  }

  const applyLayout = () => {
    if (mobileQuery.matches) {
      optionsPanel.classList.add("responsive-collapsed");
      optionsPanel.classList.remove("responsive-expanded");
      toggle.hidden = false;
      toggle.setAttribute("aria-expanded", "false");
    } else {
      optionsPanel.classList.remove("responsive-collapsed", "responsive-expanded");
      toggle.hidden = true;
      toggle.setAttribute("aria-expanded", "true");
    }
  };

  toggle.addEventListener("click", () => {
    const isExpanded = optionsPanel.classList.toggle("responsive-expanded");
    optionsPanel.classList.toggle("responsive-collapsed", !isExpanded);
    toggle.setAttribute("aria-expanded", String(isExpanded));
  });

  document.addEventListener("click", (event) => {
    if (!mobileQuery.matches || !optionsPanel.classList.contains("responsive-expanded")) {
      return;
    }

    if (optionsPanel.contains(event.target)) {
      return;
    }

    optionsPanel.classList.remove("responsive-expanded");
    optionsPanel.classList.add("responsive-collapsed");
    toggle.setAttribute("aria-expanded", "false");
  });

  mobileQuery.addEventListener("change", applyLayout);
  applyLayout();
});
