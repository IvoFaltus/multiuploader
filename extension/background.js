// background.js — FIXED (null-safe, opens tabs even with empty payload)



const AUKRO_URL =
  "https://aukro.cz/jednoduche-vystaveni?simpleFormOnDesktopAllowed=true";

const BAZOS_URL = "https://auto.bazos.cz/pridat-inzerat.php";

const SBazar_URL = "https://www.sbazar.cz/nova-nabidka";

const AukroListingsUrl = "https://aukro.cz/moje-aukro/muj-prodej/prodavam";
const SbazarListingsUrl = "https://sbazar.cz";
const  BazosListingsUrl = "https://www.bazos.cz/moje-inzeraty.php";

const facebooklistingsurl = "https://www.facebook.com/marketplace/you/selling"

const DEFAULT_API_BASE = "http://faltus-projekt.dev.spsejecna.net";

const getApiBase = () =>
  new Promise((resolve) => {
    if (!chrome?.storage?.local) {
      resolve(DEFAULT_API_BASE);
      return;
    }
    chrome.storage.local.get(["apiBase"], (result) => {
      resolve(result.apiBase || DEFAULT_API_BASE);
    });
  });


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const data = msg.payload || {};
  const platforms = Array.isArray(data.platforms) ? data.platforms : [];

  // ==================================================
  // AUKRO
  // ==================================================
  if (msg.action === "aukro") {
    console.log("Starting Aukro upload with data:", data);

    // open Aukro ALWAYS, fill only if requested
    chrome.tabs.create({ url: AUKRO_URL }, (tab) => {
      const tabId = tab.id;

      const listener = (updatedTabId, info) => {
        if (updatedTabId === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          if (platforms.includes("aukro")) {
            chrome.tabs.sendMessage(tabId, {
              action: "fillAukroForm",
              payload: data,
            });
          }
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });
    return;
  }

  // ==================================================
  // BAZOS
  // ==================================================
  if (msg.action === "bazos") {
    console.log("Opening Bazos with data:", data);

    // open Bazos ALWAYS, fill only if requested
    chrome.tabs.create({ url: BAZOS_URL }, (tab) => {
      const tabId = tab.id;

      const listener = (updatedTabId, info) => {
        if (updatedTabId === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          if (platforms.includes("bazos")) {
            chrome.tabs.sendMessage(tabId, {
              action: "fillBazosForm",
              payload: data,
            });
          }
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });
  }
  // ==================================================
  // SBAZAR
  // ==================================================
  if (msg.action === "sbazar") {
    console.log("Opening Sbazar with data:", data);

    // open Sbazar ALWAYS, fill only if requested
    chrome.tabs.create({ url: SBazar_URL }, (tab) => {
      const tabId = tab.id;

      const listener = (updatedTabId, info) => {
        if (updatedTabId === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          if (platforms.includes("sbazar")) {
            chrome.tabs.sendMessage(tabId, {
              action: "fillSbazarForm",
              payload: data,
            });
          }
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });
  }

  if (msg.action === "sync") {
    console.log("message received");
    chrome.tabs.create({ url: AukroListingsUrl, active: false }, (tab) => {
      const tabId = tab.id;
      const listener = (id, info) => {
        if (id === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.sendMessage(tabId, {

            action: "sync",
            payload: data,
            mainTab: tabId
            
          });
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });
  }
   // ==================================================
  // FACEBOOK
  // ==================================================
  if(msg.action === "facebook"){

    chrome.tabs.create(
  { url: "https://www.facebook.com/marketplace/create/" },
  tab => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === "complete") {
        chrome.tabs.sendMessage(tabId, { action: "syncFacebook",payload:data,tabId:tabId });
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  }
);

  }

  // OPEN hidden tab
if (msg.action === "openHiddenTab") {
  chrome.tabs.create({ url: msg.url, active: false }, (tab) => {
    const tabId = tab.id;

    const listener = (updatedTabId, info) => {
      if (updatedTabId === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        sendResponse(tab);
      }
    };

    chrome.tabs.onUpdated.addListener(listener);
  });
  return true;
}


// FORWARD extraction request to listing tab
if (msg.action === "extractListing") {
  chrome.tabs.sendMessage(msg.tabId,{ action: "extractListing" },response => sendResponse(response));
  return true;
}


// CLOSE tab after scraping
if (msg.action === "closeTab") {
  chrome.tabs.remove(msg.tabId);
}
if (msg.action === "syncListings") {
  (async () => {
    const apiBase = await getApiBase();
    fetch(`${apiBase}/createListing/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ listings: msg.data })
    }).then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
  })();

  return true;
}
if (msg.action === "syncListingsWithFetch") {

  (async () => {
    console.log("data are")
    console.log(msg.data)
    const data = msg.data;

    async function urlToBase64(url) {
      const res = await fetch(url);
      const blob = await res.blob();

      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    }

    for (const listing of data) {
      if (!Array.isArray(listing.images)) continue;

      listing.images = await Promise.all(
        listing.images.map(async url => {
          try {
            return await urlToBase64(url);
          } catch {
            return null;
          }
        })
      ).then(arr => arr.filter(Boolean));
    }

    const apiBase = await getApiBase();
    fetch(`${apiBase}/createListing/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ listings: data })
    })
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));

  })();

  return true;
}

 if (msg.action === "syncSbazar") {
    console.log("message received");
    chrome.tabs.create({ url: SbazarListingsUrl, active: true }, (tab) => {
      const tabId = tab.id;
      const listener = (id, info) => {
        if (id === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.sendMessage(tabId, {

            action: "syncSbazar",
            payload: data,
            mainTab:tabId
            
          });
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });
  }

  if (msg.action === "syncBazos") {
    console.log("message received");
    chrome.tabs.create({ url: BazosListingsUrl, active: true }, (tab) => {
      const tabId = tab.id;
      const listener = (id, info) => {
        if (id === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.sendMessage(tabId, {

            action: "syncBazos",
            payload: data,
            mainTab:tabId
            
          });
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });
  }
  if(msg.action==="syncFacebook"){
     console.log("message received");
    chrome.tabs.create({ url: facebooklistingsurl, active: true }, (tab) => {
      const tabId = tab.id;
      const listener = (id, info) => {
        if (id === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.sendMessage(tabId, {

            action: "syncFacebook",
            payload: data,
            mainTab:tabId
            
          });
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });
  }





  

});
