import { renderAll,addFrame,clearListings,renderSeperate,addSyncBtn,renderListingPopUp } from "./UImanager.js"
import "./UImanager.js"

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

const getListingsFor = async (platform_name,sort) => {

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

    document.querySelector(".addListingBtn").addEventListener("click",()=>{
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
        const el = sortings.find(e => e.id === savedSorting)
        if (el) setSingleCheck(el, sortings)
    }

    displays.forEach(el => {
        el.addEventListener("input", () => {
            setSingleCheck(el, displays)
            localStorage.setItem("display", el.id)
            location.reload()
        })
    })

    sortings.forEach(el => {
        el.addEventListener("input", () => {
            setSingleCheck(el, sortings)
            localStorage.setItem("sorting", el.id)
            location.reload()
        })
    })

    const getSorting = () => {
        return sortings.find(e => e.checked).id
    }

    const getDisplay = () => {
        return displays.find(e => e.checked).id
    }

    getDisplay()
    console.log(getDisplay())

    switch (getDisplay()) {

        case "all":
            console.log("case all")

            getAllListings(sortMap[getSorting()]).then((data)=>{

                console.log("date are",data)
                addFrame(1)
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

            getListingsFor("bazos",sortMap[getSorting]).then((arr) => {

                bazosListings = arr
                console.log(bazosListings)
                addFrame(1)
                renderAll(bazosListings)
            })

            reload()
            break

        case "aukroOnly":

            getListingsFor("aukro").then((arr) => {

                aukroListings = arr
                console.log(aukroListings)
                addFrame(1)
                renderAll(aukroListings)
            })

            reload()
            break

        case "sbazarOnly":

            getListingsFor("sbazar").then((arr) => {

                sbazarListings = arr
                console.log(sbazarListings)
                addFrame(1)
                renderAll(sbazarListings)
            })

            reload()
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

})
