chrome.runtime.onMessage.addListener((msg) => {
  DBG("message received:", msg);

  if (msg.action !== "sync") {
    DBG("ignored message:", msg.action);
    return;
  }
  
  
});