let userNameInput;
let userNameInput1;
let alerts;

function checkString(strVal, varName) {
    if (!strVal) throw `You must supply a ${varName}!`;
    if (typeof strVal !== "string") throw `${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
}

function checkUserName(userName, varName) {
    userName = this.checkString(userName, varName);
    if (userName.length < 3 || userName.length > 25)
      throw `${varName} must be between 3 and 25 characters (inclusive)`;
    if (userName.match(/[^\w-\_]/))
      throw `${varName} can only include letters, numbers, hyphens, and underscores.`;
    return userName.toLowerCase();
}

function onSubmitManage(event) {
    let errors = [];
    let userName = userNameInput.value;
    try {
        userName = validator.checkUserName(userName, "username");
    } catch(e) {
        errors.push(e);
    }
    if (errors.length > 0) {
        event.preventDefault();
        alerts.innerHTML = errors.toString();
        return;
    }
}

function onSubmitView(event) {
    let errors = [];
    let userName1 = userNameInput1.value;
    try {
        userName1 = validator.checkUserName(userName1, "username");
    } catch(e) {
        errors.push(e);
    }
    if (errors.length > 0) {
        event.preventDefault();
        alerts.innerHTML = errors.toString();
        return;
    }
}

function setup() {
    userNameInput = document.getElementById("userNameInput");
    userNameInput1 = document.getElementById("userNameInput1");
    alerts = document.getElementById("alerts");
    
  document
    .getElementById("manageForm")
    .addEventListener("submit", onSubmitManage);
  document
    .getElementById("viewForm")
    .addEventListener("submit", onSubmitView);
}

document.addEventListener("DOMContentLoaded", setup);