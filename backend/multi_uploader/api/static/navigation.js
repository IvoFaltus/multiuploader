
document.addEventListener('DOMContentLoaded',()=>{


const goto = (url)=>{

window.location.href = url;

}


const guide = document.querySelector(".btnD1").addEventListener("click",()=>goto("/guide/"))
const stats = document.querySelector(".btnD2").addEventListener("click",()=>goto("/statistics/"))
const settings = document.querySelector(".btnD3").addEventListener("click",()=>goto("/settings/"))
const listings = document.querySelector(".btnD4").addEventListener("click",()=>goto("/deepweb/"))



})


