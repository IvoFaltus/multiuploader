function getListingsRoot() {
    return document.querySelector(".allListings");
}



function addListing(image, title, description, platforms, frameSelector = ".frame") {
    const container = document.querySelector(frameSelector);
    if (!container) {
        return;
    }

    const card = document.createElement("div");
    card.className = "card";

    const pfpDiv = document.createElement("div");
    pfpDiv.className = "pfpDiv";
    pfpDiv.style.backgroundImage = `url(${image})`;
    pfpDiv.style.backgroundSize = "cover";
    pfpDiv.style.backgroundPosition = "center";

    const titleEl = document.createElement("a");
    titleEl.className = "title";
    titleEl.textContent = title;

    const descEl = document.createElement("a");
    descEl.className = "description";
    descEl.textContent = description;

    const platformsEl = document.createElement("a");
    platformsEl.className = "platforms";
    platformsEl.textContent = Array.isArray(platforms)
        ? platforms.map((platform) => platform.name).join(", ")
        : platforms;

    const button = document.createElement("button");
    button.className = "detail";
    button.textContent = "detail";

    card.appendChild(pfpDiv);
    card.appendChild(titleEl);
    card.appendChild(descEl);
    card.appendChild(platformsEl);
    card.appendChild(button);

    container.appendChild(card);
}

function addFrame(num) {
    const listingsRoot = getListingsRoot();
    if (!listingsRoot) {
        return null;
    }

    const frame = document.createElement("div");
    frame.className = num === 2 ? "frame2" : "frame";
    listingsRoot.appendChild(frame);
    return frame;
}

function renderAll(list) {
    for (const listing of list) {
        addListing(
            listing.images?.[0] || "",
            listing.title || "",
            listing.description || "",
            listing.platforms || []
        );
    }
}

function renderSeperate(aukro, bazos, sbazar) {
    const frame = document.querySelector(".frame2");
    if (!frame) {
        return;
    }

    const createContainer = (id, titleText, list) => {
        const container = document.createElement("div");
        container.className = `platformContainer ${id}Container`;
        container.id = id;

        const header = document.createElement("h1");
        header.textContent = titleText;
        container.appendChild(header);

        list.forEach((item) => {
            const card = document.createElement("div");
            card.className = "card2";

            const pfpDiv = document.createElement("div");
            pfpDiv.className = "pfpDiv2";
            pfpDiv.style.backgroundImage = `url(${item.images?.[0] || ""})`;
            pfpDiv.style.backgroundSize = "cover";
            pfpDiv.style.backgroundPosition = "center";

            const title = document.createElement("p");
            title.className = "title";
            title.textContent = item.title || "";

            const desc = document.createElement("p");
            desc.className = "description";
            desc.textContent = item.description || "";

            const button = document.createElement("button");
            button.className = "detail";
            button.textContent = "detail";

            const platform = item.platforms?.find((entry) => entry.name === id);
            if (platform?.link) {
                button.onclick = () => window.open(platform.link, "_blank");
            }

            card.appendChild(pfpDiv);
            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(button);

            container.appendChild(card);
        });

        frame.appendChild(container);
    };

    createContainer("aukro", "Aukro", aukro);
    createContainer("bazos", "Bazos", bazos);
    createContainer("sbazar", "SBazar", sbazar);
}

function renderSingle(list) {
    renderAll(list);
}

function clearListings() {
    const listingsRoot = getListingsRoot();
    if (listingsRoot) {
        listingsRoot.innerHTML = "";
    }
}



Array.prototype.sortArray = function(num){

    const sorts = {
        1: (a,b)=>parseFloat(a.price)-parseFloat(b.price),
        2: (a,b)=>parseFloat(b.price)-parseFloat(a.price),
        3: (a,b)=>b.id-a.id,
        4: (a,b)=>a.id-b.id
    }

    return [...this].sort(sorts[num] || (()=>0))
}
export { renderAll, renderSingle, addFrame, clearListings, renderSeperate };
export {}