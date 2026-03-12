const renderListingDetail = (listing) => {

    const existing = document.getElementById("listingDetailPanel");
    if (existing) existing.remove();

    const panel = document.createElement("div");
    panel.id = "listingDetailPanel";

    panel.innerHTML = `
        <div class="detailHeader">
            <span class="detailTitle">${listing.title}</span>
            <button class="detailClose">✕</button>
        </div>

        <div class="detailContent">

            <div class="detailImages"></div>

            <div class="detailGrid">
                <div class="detailRow">
                    <span class="detailKey">Description</span>
                    <span class="detailValue">${listing.description}</span>
                </div>

                <div class="detailRow">
                    <span class="detailKey">Price</span>
                    <span class="detailValue">${listing.price}</span>
                </div>

                <div class="detailRow">
                    <span class="detailKey">Created</span>
                    <span class="detailValue">${new Date(listing.created_at).toLocaleString()}</span>
                </div>
            </div>

            <div class="detailPlatforms"></div>

        </div>
    `;

    const imageContainer = panel.querySelector(".detailImages");

    if (listing.images && listing.images.length) {

        listing.images.forEach(src => {

            const img = document.createElement("img");
            img.src = src;
            img.className = "detailImage";

            imageContainer.appendChild(img);
        });
    }

    const platformContainer = panel.querySelector(".detailPlatforms");

    if (listing.platforms && listing.platforms.length) {

        const title = document.createElement("div");
        title.className = "platformTitle";
        title.textContent = "Platforms";

        platformContainer.appendChild(title);

        listing.platforms.forEach(p => {

            const link = document.createElement("a");

            link.href = p.link;
            link.target = "_blank";

            link.className = "platformLink";

            link.innerHTML = `
                <span class="platformName">${p.name}</span>
                <span class="platformArrow">↗</span>
            `;

            platformContainer.appendChild(link);
        });
    }

    document.body.appendChild(panel);

    panel.querySelector(".detailClose").onclick = () => {
        panel.classList.add("closing");
        setTimeout(() => panel.remove(), 200);
    };

    /* drag */

    const header = panel.querySelector(".detailHeader");

    let drag = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener("mousedown", (e) => {

        drag = true;

        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {

        if (!drag) return;

        panel.style.left = (e.clientX - offsetX) + "px";
        panel.style.top = (e.clientY - offsetY) + "px";
    });

    document.addEventListener("mouseup", () => {
        drag = false;
    });

};

export { renderListingDetail };