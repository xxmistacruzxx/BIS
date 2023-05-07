let data;

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

function checkPassword(password, varName) {
    password = this.checkString(password, varName);
    if (password.length < 8) throw `${varName} must be 8 characters or longer`;
    if (!password.match(/[A-Z]/)) throw `${varName} must have a capital letter`;
    if (!password.match(/[0-9]/)) throw `${varName} must have a number`;
    if (!password.match(/[\W_]/))
      throw `${varName} must have a special character`;
    return password;
}

function renderAlerts(listOfAlerts) {
  let accum = "";
  for (i of listOfAlerts) {
    accum = accum + `<li>${i}</li>`;
  }
  return accum;
}

function setAlerts(listOfAlerts) {
  document.querySelector("#alerts").innerHTML = renderAlerts(listOfAlerts);
}

function inputChecker() {
  let errors = [];
  
  try {
    let userNameInput = document.querySelector(
      "#userNameInput"
    ).value;
    userNameInput = checkUserName(userNameInput, "UserName");
  } catch (e) {
    errors.push(e);
  }
  try {
    let passwordInput = document.querySelector(
      "#passwordInput"
    ).value;
    passwordInput = checkPassword(
      passwordInput,
      "Password"
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
  	if(!inputChecker()) {
		  passedErrors = inputChecker();
	}
	
	if (!passedErrors) {
    	e.preventDefault();
  	}
  	return;
}

function setup() {
  $.ajax({
    url: "/data/myData",
    type: "GET",
    success: function (result) {
      data = result;
    },
    error: function (error) {
      console.log(`Error: ${error}`);
    },
  });
  document.querySelector("form").addEventListener("submit", submitButton);
}

document.addEventListener("DOMContentLoaded", setup);
