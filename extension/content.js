console.log("content.js loaded");
document.addEventListener("click", (e) => {
  if (e.target.id !== "uploadBtn") return;
  alert("Upload button clicked!");
  e.preventDefault();
  chrome.runtime.sendMessage({ action: "startUpload" });
});



