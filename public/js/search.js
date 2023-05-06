let searchInput;

function search(term) {
  // get all entities
  let anchors = document.querySelectorAll("li a");
  // reset background colors
  for (let i = 0; i < anchors.length; i++) {
    anchors[i].style.backgroundColor = "#ffd800";
  }
  if (term.replace(" ").length === 0) return;
  // highlight entities with search term
  for (let i = 0; i < anchors.length; i++) {
    let anchorHTML = anchors[i].innerHTML.split("-")[0];
    if (anchorHTML.toLowerCase().includes(term.toLowerCase())) {
      anchors[i].style.backgroundColor = "yellow";
    }
  }
}

function onSearch(e) {
  e.preventDefault();
  console.log(`searching: ${searchInput.value}`);
  search(searchInput.value);
}

function setup() {
  searchInput = document.getElementById("searchInput");
  document.getElementById("searchDiv").addEventListener("submit", onSearch);
}

document.addEventListener("DOMContentLoaded", setup);
