// background.js

const AUKRO_URL =
    "https://aukro.cz/jednoduche-vystaveni?simpleFormOnDesktopAllowed=true";

chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.action !== "startUpload") return;

    const data = msg.payload;

    // open Aukro listing page
    chrome.tabs.create({ url: AUKRO_URL }, (tab) => {
        const tabId = tab.id;

        // wait until Aukro page is fully loaded
        const listener = (updatedTabId, info) => {
            if (updatedTabId === tabId && info.status === "complete") {
                chrome.tabs.onUpdated.removeListener(listener);

                // send data to aukroContent.js
                chrome.tabs.sendMessage(tabId, {
                    action: "fillAukroForm",
                    payload: data
                });
            }
        };

        chrome.tabs.onUpdated.addListener(listener);
    });
});
