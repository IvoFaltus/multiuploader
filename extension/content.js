// content.js
let data = {};
console.log("content.js loaded");

if (chrome?.storage?.local) {
  chrome.storage.local.set({ apiBase: window.location.origin });
}

const obs = new MutationObserver(() => {


  const uploadbutton = document.querySelector(".listingSubmitBtn")
  if (uploadbutton) {
    uploadbutton.addEventListener(
      "click",
      async (e) => {
        const btn = e.target.closest(".listingSubmitBtn");



        if (!btn) return;



        // stop page scripts + navigation
        e.preventDefault();
        e.stopImmediatePropagation();

        console.log("Upload button clicked");

        if (!chrome?.runtime?.id) {
          console.warn("Extension context not available");
          return;
        }

        data = {
          title: document.querySelector('input[name="title"]')?.value ?? "",
          description:
            document.querySelector('textarea[name="description"]')?.value ?? "",
          name: document.querySelector('input[name="name"]')?.value ?? "",
          category: document.querySelector('select[name="category"]')?.value ?? "",
          priceType:
            document.querySelector('select[name="price_type"]')?.value ?? "",

          price: document.querySelector('input[name="price"]')?.value ?? "",
          saleType:
            document.querySelector('input[name="sale_type"]:checked')?.value ?? "",
          condition:
            document.querySelector('select[name="condition"]')?.value ?? "",

          email: document.querySelector('input[name="email"]')?.value ?? "",
          password: document.querySelector('input[name="password"]')?.value ?? "",

          bankAccount:
            document.querySelector('input[name="bank_account"]')?.value ?? "",
          personalPickup: !!document.querySelector('input[name="personal_pickup"]')
            ?.checked,

          city: document.querySelector('input[name="city"]')?.value ?? "",
          postal: document.querySelector('input[name="postal"]')?.value ?? "",
          phone: document.querySelector('input[name="phone"]')?.value ?? "",
          displayPhone: !!document.querySelector('input[name="displayPhone"]')?.checked,
          platforms: Array.from(
            document.querySelectorAll('input[name="platforms"]:checked'),
          ).map((cb) => cb.value),

          photos: [],
        };
        console.log(data)
        // read files synchronously before any navigation
        const fileInput = document.querySelector('input[name="photos"]');
        if (fileInput?.files?.length) {
          try {
            data.photos = await Promise.all(
              Array.from(fileInput.files).map(
                (file) =>
                  new Promise((res) => {
                    const r = new FileReader();
                    r.onload = () =>
                      res({ name: file.name, type: file.type, data: r.result });
                    r.readAsDataURL(file);
                  }),
              ),
            );
          } catch (err) {
            console.error("File read failed", err);
          }
        }

        console.log("Sending data to background.js", data);

        if (data.platforms.includes("aukro")) {
          console.log("sending to aukro")
          chrome.runtime.sendMessage({
            action: "aukro",
            payload: data,
          });
        }

        if (data.platforms.includes("bazos")) {
          console.log("sending to bazos")
          chrome.runtime.sendMessage({
            action: "bazos",
            payload: data,
          });
        }
        if (data.platforms.includes("sbazar")) {
          console.log("sending to sbazar")
          chrome.runtime.sendMessage({
            action: "sbazar",
            payload: data,
          });
        }
        if (data.platforms.includes("facebook")) {
          console.log("facebook included")
          chrome.runtime.sendMessage({
            action: "facebook",
            payload: data,
          });
        }



      },
      true,
    );
  }


})

obs.observe(document.body, {
  childList: true,
  subtree: true
})

// Ensure sync button listener is attached once it appears.
const syncObserver = new MutationObserver(() => {
  attachSyncListener();
});

syncObserver.observe(document.body, {
  childList: true,
  subtree: true
});




let syncListenerAttached = false;

const attachSyncListener = () => {
  if (syncListenerAttached) return;
  const syncButton = document.querySelector("#sync");
  if (!syncButton) return;

  syncListenerAttached = true;
  syncButton.addEventListener("click", () => {

    const popup = document.querySelector("#syncPopup");
    const syncBtn = popup?.querySelector("#syncListings");

    if (!popup || !syncBtn) return;

    syncBtn.addEventListener("click", async () => {

    const all = popup.querySelector("#all")?.checked;
    const sbazar = popup.querySelector("#sbazar")?.checked;
    const aukro = popup.querySelector("#aukro")?.checked;
    const bazos = popup.querySelector("#bazos")?.checked;
    const facebook = popup.querySelector("#facebook")?.checked;

    let payload = null;

    const tel = document.querySelector("#phoneEX")
    const email = document.querySelector("#emailEX")
    if (facebook) {
      chrome.runtime.sendMessage({
        action: "syncFacebook",
      });
      console.log("facebook sync");
    }

    if (bazos) {
      const phoneValue = tel?.textContent || "phone";
      const emailValue = email?.textContent || "email";

      payload = (email && tel) ? {
        email: emailValue,
        phone: phoneValue
      } : null;
    }

    console.log("sync executed");

    if (all) {
      chrome.runtime.sendMessage({
        action: "syncAll",
        payload: payload,
      });
    }

    if (aukro) {
      chrome.runtime.sendMessage({
        action: "sync",
        payload: data,
      });
      console.log("aukro sync");
    }

    if (sbazar) {
      chrome.runtime.sendMessage({
        action: "syncSbazar",
        payload: data,
      });
    }

    if (bazos) {
      chrome.runtime.sendMessage({
        action: "syncBazos",
        payload: payload,
      });
    }

    });
  });
};

attachSyncListener();
