//sync.js
chrome.runtime.onMessage.addListener(async msg => {
  if (msg.action !== "syncFacebook") return;

(async () => {

  if (!location.href.includes("selling")) return;

  const synced = [];

  const links = [...document.querySelectorAll('img[src*="scontent"]')]
  .map(img => img.closest('[role="button"]'))
  .filter(Boolean)
  .map(btn => {
    const label = btn.getAttribute("aria-label");
    if (!label) return null;

    // build marketplace link
    return `https://www.facebook.com/marketplace/item/${label}`;
  })
  .filter(Boolean);
console.log("links are")
console.log("listing links:", links);

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

// await chrome.runtime.sendMessage({
//   action: "closeTab",
//   tabId: msg.mainTab
// })



})();

})