//sync.js
chrome.runtime.onMessage.addListener(async msg => {
  if (msg.action !== "sync") return;

(async () => {

  if (!location.href.includes("prodavam")) return;

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const synced = [];

  

  // collect listing links
  const links = [...document.querySelectorAll(".product-name a")]
    .map(a => "https://aukro.cz" + a.getAttribute("href"));

  console.log("Listings found:", links);

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

await chrome.runtime.sendMessage({
  action: "closeTab",
  tabId: msg.mainTab
})



})();

})