import { renderAll, addFrame, clearListings, renderSeperate, addSyncBtn, renderListingPopUp } from "./UImanager.js"
import "./UImanager.js"

let selectionMode = false

const removeBtn = document.querySelector("button.removeListingBtn.aBtn")
const cancelSelectionBtn = document.querySelector(".cancelSelectionBtn")
const confirmDeleteBtn = document.querySelector(".confirmDeleteBtn")
const selectionActions = document.querySelector(".listingSelectionActions")

const getListingCards = () => Array.from(document.querySelectorAll(".card, .card2"))

const getSelectionCheckbox = (card) => card.querySelector(".rBtn")

const syncCardSelectionState = (card) => {
    const checkbox = getSelectionCheckbox(card)
    card.classList.toggle("selectedForDelete", Boolean(checkbox?.checked))
}

function toggleCardSelection(event) {
    if (!selectionMode) {
        return
    }

    if (event.target.closest(".detail") || event.target.closest(".rBtn")) {
        return
    }

    const card = event.currentTarget
    const checkbox = getSelectionCheckbox(card)
    if (!checkbox) {
        return
    }

    checkbox.checked = !checkbox.checked
    syncCardSelectionState(card)
}

const removeSelectionCheckboxes = () => {
    getListingCards().forEach((card) => {
        getSelectionCheckbox(card)?.remove()
        card.classList.remove("selectionMode", "selectedForDelete")
        card.removeEventListener("click", toggleCardSelection)
        card.querySelectorAll(".detail").forEach((button) => {
            button.disabled = false
        })
    })
}

const exitSelectionMode = () => {
    selectionMode = false
    selectionActions?.classList.add("hidden")
    removeSelectionCheckboxes()
}

const enterSelectionMode = () => {
    if (selectionMode) {
        return
    }

    selectionMode = true
    selectionActions?.classList.remove("hidden")

    getListingCards().forEach((card) => {
        if (getSelectionCheckbox(card)) {
            return
        }

        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.className = "rBtn"
        checkbox.addEventListener("click", (event) => {
            event.stopPropagation()
            syncCardSelectionState(card)
        })

        card.classList.add("selectionMode")
        card.addEventListener("click", toggleCardSelection)
        card.querySelectorAll(".detail").forEach((button) => {
            button.disabled = true
        })
        card.appendChild(checkbox)
    })
}

const deleteSelectedListings = async () => {
    const selectedCards = getListingCards().filter((card) => getSelectionCheckbox(card)?.checked)
    const selectedIds = selectedCards
        .map((card) => Number(card.dataset.listingId || card.id))
        .filter((id) => Number.isInteger(id) && id > 0)

    if (selectedIds.length === 0) {
        return
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.disabled = true
    }

    try {
        await Promise.all(
            selectedIds.map((id) =>
                fetch(`/deleteListing/${id}`, {
                    method: "POST"
                }).then((response) => {
                    if (!response.ok) {
                        throw new Error(`Failed to delete listing ${id}`)
                    }
                })
            )
        )

        selectedCards.forEach((card) => card.remove())
        exitSelectionMode()
    } catch (error) {
        console.error(error)
    } finally {
        if (confirmDeleteBtn) {
            confirmDeleteBtn.disabled = false
        }
    }
}

const getAllListings = async (sort) => {
    const res = await fetch("/getAllListings")
    const data = await res.json()
    return data.sortArray(sort)
}

const sortMap = {
    price1: 1,
    price2: 2,
    mostRecent: 3,
    oldestFirst: 4
}

const getListingsFor = async (platform_name, sort) => {

    const res = await fetch(`/getListingsForPlatform/${platform_name}`)
    const data = await res.json()

    return data.sortArray(sort)
}

let aukroListings = []
let bazosListings = []
let sbazarListings = []

document.addEventListener('DOMContentLoaded', () => {












    addSyncBtn()
    const searchInput = document.querySelector(".searchListing")

    document.querySelector(".addListingBtn").addEventListener("click", () => {
        renderListingPopUp()


    })

    const displays = Array.from(document.querySelectorAll(".optionD0 input"))
    const sortings = Array.from(document.querySelectorAll(".optionD1 input"))

    console.log("deepweb.js loaded")

    const setSingleCheck = (el, group) => {
        group.forEach(e => e.checked = false)
        el.checked = true
    }

    const savedDisplay = localStorage.getItem("display")
    if (savedDisplay) {
        const el = displays.find(e => e.id === savedDisplay)
        if (el) setSingleCheck(el, displays)
    }

    const savedSorting = localStorage.getItem("sorting")
    if (savedSorting) {
        const el = sortings.find((entry) => entry.id === savedSorting)
        if (el) {
            setSingleCheck(el, sortings)
        }
    }

    const persistAndReload = (key, value) => {
        localStorage.setItem(key, value)
        location.reload()
    }

    displays.forEach(el => {
        el.addEventListener("change", () => {
            setSingleCheck(el, displays)
            persistAndReload("display", el.id)
        })
    })

    sortings.forEach(el => {
        el.addEventListener("change", () => {
            setSingleCheck(el, sortings)
            persistAndReload("sorting", getSorting())
        })
    })

    const getSorting = () => {
        return sortings.find((entry) => entry.checked)?.id || "mostRecent"
    }

    const getDisplay = () => {
        return displays.find(e => e.checked).id
    }

    getDisplay()
    console.log(getDisplay())

    switch (getDisplay()) {

        case "all":
            console.log("case all")

            getAllListings(sortMap[getSorting()]).then((data) => {

                console.log("date are", data)
                addFrame(1, "All Listings")
                renderAll(data)

            })

            break

        case "seperate":
            addFrame(2)

            getAllListings(sortMap[getSorting()]).then((data) => {

                data.forEach((d) => {

                    d.platforms.forEach((platform) => {

                        switch (platform.name) {
                            case "bazos":
                                bazosListings.push(d)
                                break
                            case "aukro":
                                aukroListings.push(d)
                                break
                            case "sbazar":
                                sbazarListings.push(d)
                                break
                        }

                    })

                })

                renderSeperate(aukroListings, bazosListings, sbazarListings)

            })

            break

        case "bazosOnly":

            getListingsFor("bazos", sortMap[getSorting()]).then((arr) => {

                bazosListings = arr
                console.log(bazosListings)
                addFrame(1, "Bazos Listings")
                renderAll(bazosListings)
            })

            break

        case "aukroOnly":

            getListingsFor("aukro", sortMap[getSorting()]).then((arr) => {

                aukroListings = arr
                console.log(aukroListings)
                addFrame(1, "Aukro Listings")
                renderAll(aukroListings)
            })

            break

        case "sbazarOnly":

            getListingsFor("sbazar", sortMap[getSorting()]).then((arr) => {

                sbazarListings = arr
                console.log(sbazarListings)
                addFrame(1, "Sbazar Listings")
                renderAll(sbazarListings)
            })

            break
    }





    const filterVisibleListings = () => {
        const query = (searchInput?.value || "").trim().toLowerCase()
        const cards = Array.from(document.querySelectorAll(".card, .card2"))

        cards.forEach((card) => {
            const titleEl = card.querySelector(".title")
            const title = (titleEl?.textContent || "").toLowerCase()
            card.style.display = title.includes(query) ? "" : "none"
        })
    }

    searchInput?.addEventListener("input", filterVisibleListings)
    removeBtn?.addEventListener("click", enterSelectionMode)
    cancelSelectionBtn?.addEventListener("click", exitSelectionMode)
    confirmDeleteBtn?.addEventListener("click", deleteSelectedListings)

})





