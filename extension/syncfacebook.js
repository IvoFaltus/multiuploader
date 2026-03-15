// sync.js
chrome.runtime.onMessage.addListener(async msg => {
  if (msg.action !== "syncFacebook") return;

(async () => {

  if (!location.href.includes("selling")) return;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const synced = [];
  const links = [];

  const divs = [...document.querySelectorAll('div[role="button"][aria-label]')]
    .filter(el => el.querySelector('img[src*="scontent"]'));

  for (const div of divs) {

    div.click();
    await sleep(1200);

    const a = document.querySelector('a[href*="/marketplace/item/"]');

    if (a) {
      const link = "https://www.facebook.com" + a.getAttribute("href");
      links.push(link);
    }

    const closeBtn = document.querySelector('div[aria-label="Zavřít"], div[aria-label="Close"]');
    if (closeBtn) closeBtn.click();

    await sleep(800);
  }

  console.log("FOUND LINKS:", links);

  for (const link of links) {

    const tab = await chrome.runtime.sendMessage({
      action: "openHiddenTab",
      url: link
    });

    const data = await chrome.runtime.sendMessage({
      action: "extractListing",
      tabId: tab.id
    });

    synced.push(data);

    await chrome.runtime.sendMessage({
      action: "closeTab",
      tabId: tab.id
    });
  }

  console.log("SYNC DONE:", synced);

  await chrome.runtime.sendMessage({
    action: "syncListings",
    data: synced
  });

  await chrome.runtime.sendMessage({action:"closeTab",tabId:msg.tabId})



})();




});