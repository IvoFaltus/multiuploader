// content.js
let data = {};
console.log("content.js loaded");

document.addEventListener(
  "click",
  async (e) => {
    const btn = e.target.closest("#uploadBtn");
    
    

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
      chrome.runtime.sendMessage({
        action: "aukro",
        payload: data,
      });
    }

    if (data.platforms.includes("bazos")) {
      chrome.runtime.sendMessage({
        action: "bazos",
        payload: data,
      });
    }
    if (data.platforms.includes("sbazar")) {
      chrome.runtime.sendMessage({
        action: "sbazar",
        payload: data,
      });
    }



  },
  true,
); // capture phase prevents site handlers


const syncBtn = document.querySelector("#sync");





if (syncBtn) {
  syncBtn.addEventListener("click", async () => {

    const all = document.querySelector("#all").checked
    const sbazar = document.querySelector("#sbazar").checked
    const aukro = document.querySelector("#aukro").checked
    const bazos = document.querySelector("#bazos").checked
    console.log("sync executed");

    if(all){
      chrome.runtime.sendMessage({
      action: "syncAll",
      payload: data,
    })
  }
  if(aukro){

     chrome.runtime.sendMessage({
      action: "sync",
      payload: data,
    });
    console.log("aukro sync")
  }

  if(sbazar){
     chrome.runtime.sendMessage({
      action: "syncSbazar",
      payload: data,
    });
  }

  if(bazos){
     chrome.runtime.sendMessage({
      action: "syncBazos",
      payload: data,
    });
  }







  });
}
