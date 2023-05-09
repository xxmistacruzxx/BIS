import * as validator from "./validator.js";

let itemNameInput;
let itemDescriptionInput;
let itemCountInput;
let itemValueInput;

function renderAlerts(listOfAlerts) {
  let accum = "";
  for (let i of listOfAlerts) {
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
    validator.checkString(itemNameInput.value, "Item Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    validator.checkString(itemDescriptionInput.value, "Item Description");
  } catch (e) {
    errors.push(e);
  }

  if (errors.length > 0) {
    setAlerts(errors);
    return false;
  }
  return true;
}

function validateInputs2() {
  let errors = [];
  try {
    let count = Number(itemCountInput.value);
    count = validator.checkInt(count, "count");
    if (count < 0) throw `can't have negative count`;
  } catch (e) {
    errors.push(e);
  }
  if (errors.length > 0) {
    setAlerts(errors);
    return false;
  }
  return true;
}

function validateInputs3() {
  let errors = [];
  try {
    let value = Number(itemValueInput.value);
    value = validator.checkNum(value, "count");
    if (value < 0) throw `can't have negative count`;
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

function submitButton2(e) {
  let passedErrors = false;
  passedErrors = validateInputs2();

  if (!passedErrors) {
    e.preventDefault();
  }
  return;
}

function submitButton3(e) {
  let passedErrors = false;
  passedErrors = validateInputs3();

  if (!passedErrors) {
    e.preventDefault();
  }
  return;
}

function setup() {
  itemNameInput = document.getElementById("itemNameInput");
  itemDescriptionInput = document.getElementById("itemDescriptionInput");
  itemCountInput = document.getElementById("itemCountInput");
  itemValueInput = document.getElementById("itemValueInput");
  document
    .querySelector("#editInfoForm")
    .addEventListener("submit", submitButton);
  document
    .querySelector("#editCountForm")
    .addEventListener("submit", submitButton2);
  document
    .querySelector("#editValueForm")
    .addEventListener("submit", submitButton3);
}

document.addEventListener("DOMContentLoaded", setup);
