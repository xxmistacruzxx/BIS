import * as validator from './validator.js';

let roomNameInput = document.getElementById("roomNameInput").value;
let roomDescriptionInput = document.getElementById("roomDescriptionInput").value;

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
    roomNameInput = validator.checkString(roomNameInput, "Room Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    roomDescriptionInput = validator.checkString(roomDescriptionInput, "Room Description");
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