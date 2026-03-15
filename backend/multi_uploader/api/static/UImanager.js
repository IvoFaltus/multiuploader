import { handleSync } from "./syncDetail.js"
import {renderListingPopUp} from "./listingPopUp.js"
import { renderListingDetail } from "./listingDetail.js";
function getListingsRoot() {
    return document.querySelector(".allListings");
}



function addListing(obj,num,creation,image, title, description, platforms, frameSelector = ".frame") {
    const container = document.querySelector(frameSelector);
    if (!container) {
        return;
    }

    const card = document.createElement("div");
    card.className = "card";
    card.id=obj.id
    card.dataset.listingId = obj.id
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
        ? platforms
            .map((platform) => platform.name)
            .filter(Boolean)
            .map((name) => name.toUpperCase())
            .join(" / ")
        : platforms;

    const button = document.createElement("button");
    button.className = "detail";
    button.textContent = "detail";
    button.addEventListener("click",()=>{

        renderListingDetail(obj)
    })
    const created_at = document.createElement("a")
    const date = new Date(creation);

created_at.textContent =
  date.getDate() + "." +
  (date.getMonth()+1) + "." +
  date.getFullYear();
    created_at.className = "created"



    card.appendChild(pfpDiv);
    card.appendChild(titleEl);
    card.appendChild(descEl);
    card.appendChild(platformsEl);
    card.appendChild(created_at)
    card.appendChild(button);


    // if(num===0){

    //     card.style.marginTop = "100px"
        
    // }
    container.appendChild(card);
}

function addFrame(num, titleText = "All Listings") {
    const listingsRoot = getListingsRoot();
    if (!listingsRoot) {
        return null;
    }

    const frame = document.createElement("div");
    frame.className = num === 2 ? "frame2" : "frame";



     if(num===1){
        const title = document.createElement("div")
        title.textContent = titleText
        title.className = 'title1'
        frame.appendChild(title)
        
    }
    listingsRoot.appendChild(frame);


   
    return frame;
}


const addTitle = (text)=>{





}

function renderAll(list) {

    

    for (const [i,listing] of list.entries()) {
        addListing(
            listing,
            i,
            listing.created_at,
            listing.images?.[0] || "",
            listing.title || "",
            listing.description || "",
            listing.platforms || []
            
        );
    }
}

function renderSeperate(aukro, bazos, sbazar, facebook) {
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
        let i=0
        list.forEach((item) => {
            
            const card = document.createElement("div");
            if(i===0) card.style.marginTop = "100px"
            i++
            card.className = "card2";
            card.id = item.id;
            card.dataset.listingId = item.id;

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
    createContainer("bazos", "Bazoš", bazos);
    createContainer("sbazar", "SBazar", sbazar);
    createContainer("facebook", "Facebook", facebook);
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


const addSyncBtn = ()=>{
const navbar = document.querySelector(".header1");
if (!navbar || document.getElementById("sync")) {
    return
}

const btn = document.createElement("button")
btn.textContent = "Sync"
btn.id = "sync"
btn.type = "button"
btn.className = "navbarSyncBtn"
navbar.appendChild(btn)

btn.addEventListener('click',()=>{
handleSync()

})



}





export { renderAll, renderSingle, addFrame, clearListings, renderSeperate,addSyncBtn,renderListingPopUp };
export {}
