//content.js

console.log("content.js loaded");

document.addEventListener("click", (e) => {
    if (e.target.id !== "uploadBtn") return;
    e.preventDefault();
    console.log("upload");
    const data = {
        title: document.querySelector('input[name="title"]')?.value,
        description: document.querySelector('textarea[name="description"]')?.value,
        price: document.querySelector('input[name="price"]')?.value,
        saleType: document.querySelector('select[name="sale_type"]')?.value,
        condition: document.querySelector('select[name="condition"]')?.value,
        bankAccount: document.querySelector('input[name="bank_account"]')?.value,
        personalPickup: document.querySelector('input[name="personal_pickup"]')?.checked,
        city: document.querySelector('input[name="city"]')?.value,
        postal: document.querySelector('input[name="postal"]')?.value,
        phone: document.querySelector('input[name="phone"]')?.value,
        platforms: Array.from(
            document.querySelectorAll('input[name="platforms"]:checked')
        ).map(cb => cb.value),
        photos: Array.from(
            document.querySelector('input[name="photos"]')?.files || []
        ).map(f => f.name)
    };

    console.log("Listing data:", data);

    chrome.runtime.sendMessage({
        action: "startUpload",
        payload: data
    });
});
