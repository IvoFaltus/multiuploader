console.log("[syncBazos] script loaded");

const SYNC_STATE_KEY = "syncBazosState";
const SYNC_STATUS_FILL = "fill-and-submit";
const SYNC_STATUS_PROCESS = "process-links";
const FORM_EMAIL_SELECTOR =
  "body > div > div.flexmain > div.maincontent > form > span:nth-child(1) > input";
const FORM_PHONE_SELECTOR =
  "body > div > div.flexmain > div.maincontent > form > span:nth-child(2) > input";
const FORM_SUBMIT_SELECTOR = "#submit";
const LINKS_SELECTOR = ".inzeraty .nadpis a";

function readState() {
  try {
    const raw = sessionStorage.getItem(SYNC_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("[syncBazos] failed to read state", error);
    return null;
  }
}

function writeState(state) {
  sessionStorage.setItem(SYNC_STATE_KEY, JSON.stringify(state));
}

function clearState() {
  sessionStorage.removeItem(SYNC_STATE_KEY);
}

function waitForLinks(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();

    const check = () => {
      const links = Array.from(document.querySelectorAll(LINKS_SELECTOR)).map(
        (anchor) => anchor.href,
      );

      if (links.length) {
        resolve(links);
        return;
      }

      if (Date.now() - started >= timeoutMs) {
        reject(new Error("Timed out waiting for Bazos listing links"));
        return;
      }

      setTimeout(check, 200);
    };

    check();
  });
}

async function syncLinks(links, mainTab) {
  const synced = [];

  for (const link of links) {
    const tab = await chrome.runtime.sendMessage({
      action: "openHiddenTab",
      url: link,
    });

    const listing = await chrome.runtime.sendMessage({
      action: "extractListing",
      tabId: tab.id,
    });

    if (listing) {
      synced.push(listing);
    }

    await chrome.runtime.sendMessage({
      action: "closeTab",
      tabId: tab.id,
    });
  }

  await chrome.runtime.sendMessage({
    action: "syncListingsWithFetch",
    data: synced,
  });

  await chrome.runtime.sendMessage({
    action: "closeTab",
    tabId: mainTab,
  });
}

async function processListingsPage(state) {
  if (!state || state.status !== SYNC_STATUS_PROCESS) {
    return;
  }

  try {
    const links = await waitForLinks();
    console.log("[syncBazos] links after submit:", links);
    clearState();
    await syncLinks(links, state.mainTab);
  } catch (error) {
    console.error("[syncBazos] failed to process listing links", error);
  }
}

function fillAndSubmit(payload, mainTab) {
  const emailInput = document.querySelector(FORM_EMAIL_SELECTOR);
  const phoneInput = document.querySelector(FORM_PHONE_SELECTOR);
  const submitBtn = document.querySelector(FORM_SUBMIT_SELECTOR);

  if (!emailInput || !phoneInput || !submitBtn) {
    console.error("[syncBazos] required form inputs were not found");
    return;
  }

  emailInput.value = payload.email || "";
  phoneInput.value = payload.phone || "";

  emailInput.dispatchEvent(new Event("input", { bubbles: true }));
  emailInput.dispatchEvent(new Event("change", { bubbles: true }));
  phoneInput.dispatchEvent(new Event("input", { bubbles: true }));
  phoneInput.dispatchEvent(new Event("change", { bubbles: true }));

  writeState({
    status: SYNC_STATUS_PROCESS,
    mainTab,
  });

  submitBtn.click();
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action !== "syncBazos") {
    return;
  }

  const state = {
    status: SYNC_STATUS_FILL,
    payload: msg.payload || {},
    mainTab: msg.mainTab,
  };

  writeState(state);
  fillAndSubmit(state.payload, state.mainTab);
});

const pendingState = readState();

if (pendingState?.status === SYNC_STATUS_PROCESS) {
  processListingsPage(pendingState);
}
