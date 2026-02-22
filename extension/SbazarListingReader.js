chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action !== "extractListing") return;

  (async () => {
    const clean = t => t?.replace(/\s+/g, " ").trim() || null;

    const priceText = document.querySelector(
      "body > div.flex.flex-col > div.grow.flex.justify-center > div > div.flex.justify-center.mb-12 > div > main > astro-island > div.md\\:grid.grid-cols-detail.gap-9.mt-2.md\\:mt-5 > div.hidden.md\\:block > div.flex.flex-col.text-center.w-full.border.border-solid.border-gray-border.rounded-3xl.items-center.mb-8 > div.flex.flex-col.justify-center.w-full.pb-6 > div > span.font-bold.text-pretty.speakable.price.text-4xl"
    )?.textContent;

    const price = Number(
      priceText?.replace(/\s/g, "").replace(/[^\d.,]/g, "").replace(",", ".")
    ) || null;

    const desc = clean(
      document.querySelector(
        "body > div.flex.flex-col > div.grow.flex.justify-center > div > div.flex.flex.justify-center.mb-12 > div > main > astro-island > div.md\\:grid.grid-cols-detail.gap-9.mt-2.md\\:mt-5 > div:nth-child(1) > div.mx-4.md\\:mx-0 > div.mb-4.md\\:mb-6.text-sm.md\\:text-base > div"
      )?.textContent
    );

    const title = clean(
      document.querySelector(
        "body > div.flex.flex-col > div.grow.flex.justify-center > div > div.flex.justify-center.mb-12 > div > main > astro-island > div.mx-3.md\\:mx-0 > h1"
      )?.textContent
    );

    const images = await Promise.all(
      [...document.querySelectorAll('[data-test="carousel"] img')]
        .map(async img => {
          try {
            const url = img.src.startsWith("http")
              ? img.src
              : "https:" + img.src;

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
    ).then(arr => arr.filter(Boolean));

    const listing = {
      platform: "sbazar",
      link: location.href,
      title,
      description: desc,
      price,
      images
    };

    sendResponse(listing);
  })();

  return true;
});