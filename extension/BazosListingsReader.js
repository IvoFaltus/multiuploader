chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action !== "extractListing") return;

  (async () => {

    // display phone number
    document
      .querySelector("#overlaytel > td:nth-child(2) > span > span")
      ?.click();

    const title =
      document.querySelector(".nadpisdetail")?.textContent.trim() || null;

    const description =
      document.querySelector(".popisdetail")?.textContent.trim() || null;

    const priceText =
      document.querySelector("span[translate='no']")?.textContent.trim();

    let price = Number(
      priceText?.replace(/\s/g, "").replace(/[^\d.,]/g, "").replace(",", ".")
    ) || null;
    

    const images = [...document.querySelectorAll("img.carousel-cell-image")]
  .map(e => {
    return e.src;
  })

    const listing = {
      platform: "bazos",
      link: location.href,
      title,
      description,
      price,
      images
    };

    console.log(listing);
    sendResponse(listing);

  })();

  return true;
});
