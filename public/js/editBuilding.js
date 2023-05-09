import * as validator from './validator.js';

let buildingNameInput = document.getElementById("buildingNameInput").value;
let buildingDescriptionInput = document.getElementById("buildingDescriptionInput").value;
let buildingAddressInput = document.getElementById("buildingAddressInput").value;
let buildingCityInput = document.getElementById("buildingCityInput").value;
let buildingStateInput = document.getElementById("buildingStateInput").value;
let buildingZipInput = document.getElementById("buildingZipInput").value;

let data;

function validateBuildingandAddress(buildingName, varName) {
	if (!buildingName) throw `You must supply a ${varName}!`;
  	if (typeof buildingName !== "string") throw `${varName} must be a string!`;
  	buildingName = buildingName.trim();
  	if (buildingName.length === 0)
    	throw `${varName} cannot be an empty string or string with just spaces`;
	if(buildingName.match(/[A-Za-z0-9]/)) 
		throw `${varName} can only include letters and numbers`;
  	return buildingName;
}

function validateCityandState(buildingState, varName) {
  if (!buildingState) throw `You must supply a ${varName}!`;
  if (typeof buildingState !== "string") throw `${varName} must be a string!`;
  buildingState = buildingState.trim();
  if (buildingState.length === 0)
    throw `${varName} cannot be an empty string or string with just spaces`;
  if (buildingState.match(/[0-9]/))
    throw `${strVal} is not a valid value for ${varName} as it contains digits`;
  return strVal;
}

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
    buildingNameInput = validateBuildingandAddress(buildingNameInput, "Building Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    buildingDescriptionInput = validator.checkString(buildingDescriptionInput, "Building Description");
  } catch (e) {
    errors.push(e);
  }
  try {
    buildingAddressInput = validateBuildingandAddress(buildingAddressInput, "Building Street Address");
  } catch (e) {
    errors.push(e);
  }
  try {
    buildingCityInput = validateCityandState(buildingCityInput, "Building City");
  } catch (e) {
    errors.push(e);
  }
  try {
    buildingStateInput = validateCityandState(buildingStateInput, "Building State");
  } catch (e) {
    errors.push(e);
  }
  try {
    buildingZipInput = validator.checkNum(buildingZipInput, "Building Zip");
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
