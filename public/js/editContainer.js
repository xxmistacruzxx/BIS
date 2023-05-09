import * as validator from './validator.js';

let containerNameInput = document.getElementById("containerNameInput").value;
let containerDescriptionInput = document.getElementById("containerDescriptionInput").value;

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
    containerNameInput = validator.checkString(containerNameInput, "Container Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    containerDescriptionInput = validator.checkString(containerDescriptionInput, "Container Description");
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

document.addEventListener("DOMContentLoaded", setup);