chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "syncFacebook") return;

  let i = 0;

  const timer = setInterval(() => {
    console.log(i);

    const btn = [...document.querySelectorAll("span")].find(
      el =>
        el.textContent?.includes("Vytvořit") ||
        el.textContent?.includes("Create")
    );

    if (btn) {
      btn.closest('[role="none"]').click();
      console.log("clicked");
      clearInterval(timer);
    }

    if (i > 30) clearInterval(timer); // safety stop
    i++;
  }, 100);
});