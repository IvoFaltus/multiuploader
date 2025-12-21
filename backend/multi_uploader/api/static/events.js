import { backgrounds } from "./script.js";
import { fadeToBackground } from "./script.js";
import { toggle } from "./script.js";








let location = "home";
console.log(backgrounds);

// local state
let bgToggle = false;

const delayedRemove = (el, cls, delay) => {
  setTimeout(() => el.classList.remove(cls), delay);
};

const switchToPage = (pageClass) => {
  console.log("switching");

  if (backgrounds.length >= 2) {
    fadeToBackground(bgToggle ? backgrounds[0] : backgrounds[1]);
    bgToggle = !bgToggle;
  }

  // hide only pages
  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));

  // show target page after fade
  const page = document.querySelector(`.${pageClass}`);
  if (page) delayedRemove(page, "hidden", 1000);
};

document.getElementById("About").addEventListener("click", () => {
switchToPage("page-about"); 

});

document.getElementById("Contact").addEventListener("click", () => {
  switchToPage("page-contact"); 
});

document.getElementById("Home").addEventListener("click", () => {
  switchToPage("page-home"); 
});

document.getElementById("Login").addEventListener("click", () => {
  switchToPage("page-login"); 
});

document.getElementById("Register").addEventListener("click", () => {
  alert("register")
  switchToPage("page-register"); 
});
