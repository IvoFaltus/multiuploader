console.log("[syncBazos] script loaded");

const savedLinks = sessionStorage.getItem("syncBazosLinks");
if (savedLinks) {
  console.log("[syncBazos] links from previous page:", JSON.parse(savedLinks));
  sessionStorage.removeItem("syncBazosLinks");
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action !== "syncBazos") return;

  const data = msg.payload || {};
  alert("hello");

  const emailInput = document.querySelector(
    "body > div > div.flexmain > div.maincontent > form > span:nth-child(1) > input",
  );
  const phoneInput = document.querySelector(
    "body > div > div.flexmain > div.maincontent > form > span:nth-child(2) > input",
  );
  const confirmBtn = document.querySelector("#submit");

  if (!emailInput || !phoneInput || !confirmBtn) {
    console.error("[syncBazos] required form inputs were not found");
    return;
  }

  emailInput.value = data.email || "";
  phoneInput.value = data.phone || "";

  const links = Array.from(document.querySelectorAll(".inzeraty .nadpis a")).map(
    (a) => a.href,
  );
  console.log("[syncBazos] links before submit:", links);
  sessionStorage.setItem("syncBazosLinks", JSON.stringify(links));

  confirmBtn.click();
});
