import * as validator from './validator.js';

let itemNameInput = document.getElementById("itemNameInput").value;
let itemDescriptionInput = document.getElementById("itemDescriptionInput").value;
let itemCountInput = document.getElementById("itemCountInput").value;
let itemValueInput = document.getElementById("itemValueInput").value;

let data;

function renderAlerts(listOfAlerts) {
  let accum = "";
  for (i of listOfAlerts) {
    accum = accum + `<p class="error-message">${i}</p>`;
  }
  return accum;
}

function setAlerts(listOfAlerts) {
  document.querySelector("#alerts").innerHTML = renderAlerts(listOfAlerts);
}

function validateInputs() {
  let errors = [];

  try {
    itemNameInput = validator.checkString(itemNameInput, "Item Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    itemDescriptionInput = validator.checkString(itemDescriptionInput, "Item Description");
  } catch (e) {
    errors.push(e);
  }
  try {
    itemCountInput = validator.checkInt(itemCountInput, "Item Count");
  } catch (e) {
    errors.push(e);
  }
  try {
    itemValueInput = validator.checkNum(itemValueInput, "Item Description");
  } catch (e) {
    errors.push(e);
  }

  if (errors.length > 0) {
    setAlerts(errors);
    return false;
  }
  return true;
}

function submitButton(e) {
  let passedErrors = false;
  passedErrors = validateInputs();

  if (!passedErrors) {
    e.preventDefault();
  }
  return;
}

function setup() {
  document.querySelector("form").addEventListener("submit", submitButton);
}

document.addEventListener("DOMContentLoaded", setup);import * as validator from './validator.js';