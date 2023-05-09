import * as validator from "./validator.js";

let roomNameInput;
let roomDescriptionInput;

let data;

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
    validator.checkString(roomNameInput.value, "Room Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    validator.checkString(
      roomDescriptionInput.value,
      "Room Description"
    );
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
  roomNameInput = document.getElementById("roomNameInput");
  roomDescriptionInput = document.getElementById("roomDescriptionInput");
  document.querySelector("form").addEventListener("submit", submitButton);
}

document.addEventListener("DOMContentLoaded", setup);
