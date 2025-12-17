chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action !== "fillAukroForm") return;

    const data = msg.payload;

    const wait = setInterval(() => {
        const title = document.querySelector('input[name="name"]');
        const desc = document.querySelector('textarea[name="description"]');





        if (!title || !desc) return;

        clearInterval(wait);

        title.focus();
        title.value = data.title;
        title.dispatchEvent(new Event("input", { bubbles: true }));

        desc.focus();
        desc.value = data.description;
        desc.dispatchEvent(new Event("input", { bubbles: true }));

        console.log("Aukro fields filled");
    }, 300);
});
