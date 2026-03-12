function handleSync() {

    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = "120px";
    popup.style.left = "120px";
    popup.style.width = "280px";
    popup.style.background = "var(--panel-gradient)";
    popup.style.color = "var(--c6)";
    popup.style.borderRadius = "12px";
    popup.style.padding = "16px";
    popup.style.boxShadow = "var(--boxShadowMedium)";
    popup.style.zIndex = "9999";
    popup.style.fontFamily = "system-ui, sans-serif";
    popup.style.border = "1px solid var(--shadow2)";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.cursor = "move";
    header.style.marginBottom = "14px";
    header.style.fontWeight = "600";
    header.style.fontSize = "15px";

    const title = document.createElement("span");
    title.textContent = "Sync Listings";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.background = "transparent";
    closeBtn.style.border = "none";
    closeBtn.style.color = "var(--c7)";
    closeBtn.style.fontSize = "15px";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => popup.remove();

    header.appendChild(title);
    header.appendChild(closeBtn);

    const description = document.createElement("div");
    description.style.fontSize = "13px";
    description.style.color = "var(--c7)";
    description.style.marginBottom = "12px";
    description.textContent =
        "Select marketplaces where the current listing should be synchronized. The extension will copy the listing data and upload it to the selected platforms.";

    const options = document.createElement("div");
    options.style.display = "flex";
    options.style.flexDirection = "column";
    options.style.gap = "6px";
    options.style.marginBottom = "16px";

    options.innerHTML = `
        <label><input type="checkbox" id="all"> All</label>
        <label><input type="checkbox" id="aukro"> Aukro</label>
        <label><input type="checkbox" id="sbazar"> SBazar</label>
        <label><input type="checkbox" id="bazos"> Bazos</label>
    `;

    const button = document.createElement("button");
    button.id = "syncListings";
    button.textContent = "Sync";
    button.style.width = "100%";
    button.style.height = "38px";
    button.style.border = "none";
    button.style.borderRadius = "8px";
    button.style.background = "var(--control-gradient)";
    button.style.color = "var(--c6)";
    button.style.cursor = "pointer";
    button.style.fontSize = "14px";
    button.style.boxShadow = "var(--boxShadowSoft)";
    button.onclick = () => popup.remove();


    popup.id = "syncPopup"
    popup.appendChild(header);
    popup.appendChild(description);
    popup.appendChild(options);
    popup.appendChild(button);

    document.body.appendChild(popup);

    /* draggable */
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener("mousedown", (e) => {
        dragging = true;
        offsetX = e.clientX - popup.offsetLeft;
        offsetY = e.clientY - popup.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        popup.style.left = (e.clientX - offsetX) + "px";
        popup.style.top = (e.clientY - offsetY) + "px";
    });

    document.addEventListener("mouseup", () => {
        dragging = false;
    });
}

export { handleSync };