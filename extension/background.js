// background.js — FIXED (null-safe, opens tabs even with empty payload)

const AUKRO_URL =
  "https://aukro.cz/jednoduche-vystaveni?simpleFormOnDesktopAllowed=true";

const BAZOS_URL = "https://auto.bazos.cz/pridat-inzerat.php";

const SBazar_URL = "https://www.sbazar.cz/nova-nabidka";

const AukroListingsUrl = "https://aukro.cz/moje-aukro/muj-prodej/prodavam";
chrome.runtime.onMessage.addListener((msg, sender) => {
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
            
          });
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });
  }
});
