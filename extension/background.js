// background.js
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "startUpload") return;

  chrome.tabs.create({
    url: "https://aukro.cz/jednoduche-vystaveni?simpleFormOnDesktopAllowed=true"
  });
});
