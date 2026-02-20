chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.action !== "extractListing") return;

})