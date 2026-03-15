chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action !== "extractListing") return;

  const price= document.querySelector(
  'h1[aria-hidden="false"] + div span[dir="auto"]'
)?.innerText.trim();

console.log(price);
  const title =
    document.querySelector(
      'div.xyamay9.xv54qhq.x18d9i69.xf7dkkf > h1[aria-hidden="false"] span[dir="auto"]'
    )?.textContent?.trim() ||
    document.querySelector('h1 span[dir="auto"]')?.textContent?.trim() ||
    null;

  const description =
    document.querySelector('div.xz9dl7a span[dir="auto"]')?.innerText.trim() ||
    [...document.querySelectorAll('div[dir="auto"], span[dir="auto"]')]
      .map((node) => node.innerText?.trim())
      .find((text) => text && text.length > 40 && text !== title) ||
    null;

  const img =
    document.querySelector('img[alt^="Fotka produktu"]') ||
    document.querySelector('img[referrerpolicy="origin-when-cross-origin"]') ||
    document.querySelector('img[src*="scontent"]');

  async function getBase64(image) {
    if (!image?.src) {
      return [];
    }

    const res = await fetch(image.src);
    const blob = await res.blob();

    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve([reader.result]);
      reader.readAsDataURL(blob);
    });
  }

  getBase64(img)
    .then((images) => {
      sendResponse({
        platform: "facebook",
        link: location.href,
        title,
        description,
        price,
        images
      });
    })
    .catch(() => {
      sendResponse({
        platform: "facebook",
        link: location.href,
        title,
        description,
        price,
        images: []
      });
    });

  return true; // keeps message channel open for async response
});
