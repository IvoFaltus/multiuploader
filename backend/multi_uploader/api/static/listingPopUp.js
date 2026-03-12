function renderListingPopUp() {

    const existing = document.querySelector(".listingPopup");
    if (existing) existing.remove();

    const popup = document.createElement("div");
    popup.className = "listingPopup";

    popup.innerHTML = `
        <div class="listingPopupHeader">
            <span>Create Listing</span>
            <button class="listingPopupClose">✕</button>
        </div>

        <div class="listingPopupBody">

            <input type="text" name="title" class="listingInput" placeholder="Title">

            <textarea name="description" rows="4" class="listingTextarea" placeholder="Description"></textarea>

            <select name="price_type" class="listingSelect">
                <option value="">Price Type</option>
                <option value="Dohodou">Dohodou</option>
                <option value="Nabídněte">Nabídněte</option>
                <option value="Nerozhoduje">Nerozhoduje</option>
                <option value="V textu">V textu</option>
                <option value="Zdarma">Zdarma</option>
            </select>

            <div class="listingToggleGroup">
                <label>
                    <input type="radio" name="sale_type" value="buy_now" checked>
                    Kup teď
                </label>

                <label>
                    <input type="radio" name="sale_type" value="auction">
                    Aukce
                </label>
            </div>

            <input type="number" name="price" class="listingInput" placeholder="Price" step="0.01">

            <div class="imageUploadArea">
                <input type="file" name="photos" class="listingFile" multiple>
                <div class="imagePreview"></div>
            </div>

            <input type="text" name="name" class="listingInput" placeholder="Name">
            <input type="email" name="email" class="listingInput" placeholder="E-mail">
            <input type="password" name="password" class="listingInput" placeholder="Password">

            <input type="text" name="bank_account" class="listingInput" placeholder="Bank account">

            <label class="listingLabel">
                <input type="checkbox" name="personal_pickup">
                Nabídnout osobní předání
            </label>

            <input type="text" name="city" class="listingInput" placeholder="City">
            <input type="text" name="postal" class="listingInput" placeholder="Postal Code">
            <input type="text" name="phone" class="listingInput" placeholder="Phone">

            <div class="platformSelector">

                <label class="platformCard">
                    <input type="checkbox" value="bazos">
                    <span>Bazos</span>
                </label>

                <label class="platformCard">
                    <input type="checkbox" value="sbazar">
                    <span>Sbazar</span>
                </label>

                <label class="platformCard">
                    <input type="checkbox" value="facebook">
                    <span>Facebook</span>
                </label>

                <label class="platformCard">
                    <input type="checkbox" value="aukro">
                    <span>Aukro</span>
                </label>

            </div>

            <label class="listingLabel">
                <input type="checkbox" name="displayPhone">
                Zobrazit číslo
            </label>

            <button class="listingSubmitBtn">Submit</button>

        </div>
    `;

    document.body.appendChild(popup);

    const header = popup.querySelector(".listingPopupHeader");
    const fileInput = popup.querySelector(".listingFile");
    const preview = popup.querySelector(".imagePreview");

    popup.querySelector(".listingPopupClose").onclick = () => popup.remove();

    /* image preview */

    fileInput.addEventListener("change", () => {

        preview.innerHTML = "";

        [...fileInput.files].forEach(file => {

            const reader = new FileReader();

            reader.onload = e => {

                const img = document.createElement("img");
                img.src = e.target.result;
                img.className = "previewImage";

                preview.appendChild(img);
            };

            reader.readAsDataURL(file);
        });

    });

    /* draggable */

    let drag = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener("mousedown", (e) => {

        drag = true;

        offsetX = e.clientX - popup.offsetLeft;
        offsetY = e.clientY - popup.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {

        if (!drag) return;

        popup.style.left = (e.clientX - offsetX) + "px";
        popup.style.top = (e.clientY - offsetY) + "px";
    });

    document.addEventListener("mouseup", () => drag = false);

    popup.querySelector(".listingSubmitBtn").onclick = () => {
        popup.remove();
    };

}

export { renderListingPopUp };