chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action !== "extractListing") return;

    document.querySelector("#overlaytel > td:nth-child(2) > span > span").click() //display phone number

    const title =
        document.querySelector(".nadpisdetail")?.textContent.trim()

    const description =
        document.querySelector(".popisdetail")?.textContent.trim()

    const price =
        document.querySelector("span[translate='no']")?.textContent.trim()

    const images = []

    console.log(title.)









    const listing = {
        platform: "bazos",
        link: location.href,
        title,
        description,
        price,
        images
    };

    sendResponse(listing);



})