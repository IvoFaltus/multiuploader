const switchPage = btn =>
  new Promise(res => {
    const oldUrl = location.href;

    btn.click();

    const observer = new MutationObserver(() => {
      const urlOk = location.href.includes("bazar/");
      const contentReady = document.querySelector('[data-test="offer-list"]');

      if (location.href !== oldUrl && urlOk && contentReady) {
        observer.disconnect();
        res();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });


chrome.runtime.onMessage.addListener(async msg => {
  if (msg.action !== "syncSbazar") return;
  const maintab = msg.mainTab
  const iconBtn = document
    .querySelector("#ribbon-badge > szn-login-widget")
    ?.shadowRoot?.querySelector("#badge");

  const mojeNabidkyBtn = document.querySelector(
    "#ribbon-badge > szn-login-widget > ul > li:nth-child(3) > a"
  );

  if (!iconBtn || !mojeNabidkyBtn) return;

  const links = [];

  iconBtn.click();
  await switchPage(mojeNabidkyBtn);

  document
    .querySelectorAll('[data-test="offer-list"] a[href^="/inzerat/"]')
    .forEach(a => {
      const href = "https://sbazar.cz" + a.getAttribute("href");
      if (!href.includes("/topovani")) links.push(href);
    });

  console.log("links found:", links);

  const synced = [];

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

  await chrome.runtime.sendMessage({
    action: "syncListings",
    data: synced,
    
  });
  await chrome.runtime.sendMessage({action: "closeTab",tabId:msg.mainTab})
});