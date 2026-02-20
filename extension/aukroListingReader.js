chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.action !== "extractListing") return;

  const wait = ms => new Promise(r => setTimeout(r, ms));

  (async () => {
    await wait(2500);

    const clean = t => t?.replace(/\s+/g, " ").trim() || null;

    // download images as Blob objects
    const images = await Promise.all(
  [...document.querySelectorAll("auk-item-detail-media-thumbs img")]
    .map(async img => {
      const url = img.src.replace("/73x73/", "/");

      try {
        const blob = await fetch(url).then(r => r.blob());

        return await new Promise(res => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result);
          reader.readAsDataURL(blob);
        });

      } catch {
        return null;
      }
    })
);


    const listing = {
      platform: "aukro",
      link: location.href,
      title: clean(document.querySelector(".tw-font-bold.tw-text-xl")?.innerText),
      description: clean(document.querySelector("#user-field")?.innerText),
      price: clean(document.querySelector(".tw-text-3xl.tw-font-bold")?.innerText)
        ?.replace(/[^\d.,]/g, "")
        ?.replace(",", "."),

      sale_type:
        clean(document.querySelector("auk-item-detail-main-item-panel-state div")?.innerText)
          ?.toLowerCase().includes("aukce")
          ? "auction"
          : "buy_now",

      category:
        [...document.querySelectorAll("auk-connection-links a")]
          .map(a => clean(a.innerText))
          .join(", ") || null,

      images: images.filter(Boolean), // actual downloaded images

      condition: null,
      name: null,
      email: null,
      bank_account: null,
      city: null,
      postal: null,
      phone: null,
      personal_pickup: false,
      display_phone: false
    };

    console.log("Extracted listing:", listing);
    sendResponse(listing);

  })();

  return true;
});
