chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "syncSbazar") {
    return;
  }

  const iconBtn = document
    .querySelector("#ribbon-badge > szn-login-widget")
    .shadowRoot.querySelector("#badge");

  const mojeNabidkyBtn = document.querySelector(
    "#ribbon-badge > szn-login-widget > ul > li:nth-child(3) > a",
  );





  const links = [];
  iconBtn.click()

  setTimeout(()=>mojeNabidkyBtn.click(),1000)
  
  document
    .querySelectorAll('[data-test="offer-list"] a[href^="/inzerat/"]')
    .forEach((a) => {
      const href = a.getAttribute("href");
      if (!href.includes("/topovani")) {
        links.push(href);
      }
    });

  console.log(`links are ${links}`); // fix links
});
