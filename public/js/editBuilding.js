import * as validator from "./validator.js";

let buildingNameInput;
let buildingDescriptionInput;
let buildingAddressInput;
let buildingCityInput;
let buildingStateInput;
let buildingZipInput;

function validateCityandState(buildingState, varName) {
  if (!buildingState) throw `You must supply a ${varName}!`;
  if (typeof buildingState !== "string") throw `${varName} must be a string!`;
  buildingState = buildingState.trim();
  if (buildingState.length === 0)
    throw `${varName} cannot be an empty string or string with just spaces`;
  if (buildingState.match(/[0-9]/))
    throw `${buildingState} is not a valid value for ${varName} as it contains digits`;
  return buildingState;
}

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
    validator.checkString(buildingNameInput.value, "Building Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    validator.checkString(
      buildingDescriptionInput.value,
      "Building Description"
    );
  } catch (e) {
    errors.push(e);
  }
  try {
    validator.checkString(
      buildingAddressInput.value,
      "Building Street Address"
    );
  } catch (e) {
    errors.push(e);
  }
  try {
    validateCityandState(buildingCityInput.value, "Building City");
  } catch (e) {
    errors.push(e);
  }
  try {
    validateCityandState(buildingStateInput.value, "Building State");
  } catch (e) {
    errors.push(e);
  }
  try {
    validator.checkString(buildingZipInput.value, "Building Zip");
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
  buildingNameInput = document.getElementById("buildingNameInput");
  buildingDescriptionInput = document.getElementById(
    "buildingDescriptionInput"
  );
  buildingAddressInput = document.getElementById("buildingAddressInput");
  buildingCityInput = document.getElementById("buildingCityInput");
  buildingStateInput = document.getElementById("buildingStateInput");
  buildingZipInput = document.getElementById("buildingZipInput");

  document.querySelector("form").addEventListener("submit", submitButton);
}

document.addEventListener("DOMContentLoaded", setup);
