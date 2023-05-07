import * as validator from "./validator.js";

let profilePictureInput;

let userNameInput;
let firstNameInput;
let lastNameInput;
let emailAddressInput;

let passwordInput;
let confirmPasswordInput;

let alerts;

function getExtension(filename) {
  var parts = filename.split(".");
  return parts[parts.length - 1];
}

function isImage(filename) {
  let ext = getExtension(filename);
  switch (ext.toLowerCase()) {
    case "jpg":
    case "png":
      return true;
  }
  return false;
}

function onSubmitPicture(e) {
  let errors = [];
  if (profilePictureInput.files.length == 0) {
    errors.push("Please select a file first");
  }
  if (profilePictureInput.files.length >= 2) {
    errors.push("Please select only one file");
  }
  if (errors.length > 0) {
    e.preventDefault();
    alerts.innerHTML = errors.toString();
    return;
  }
  let fileName = profilePictureInput.files[0].name;
  if (!isImage(fileName)) errors.push("File must be a jpg or png");
  if (errors.length > 0) {
    e.preventDefault();
    alerts.innerHTML = errors.toString();
    return;
  }
}

function onSubmitInfo(event) {
  let errors = [];
  let userName = userNameInput.value;
  let firstName = firstNameInput.value;
  let lastName = lastNameInput.value;
  let emailAddress = emailAddressInput.value;
  try {
    userName = validator.checkUserName(userName, "username");
  } catch (e) {
    errors.push(e);
  }
  try {
    firstName = validator.checkName(firstName, "first name");
  } catch (e) {
    errors.push(e);
  }
  try {
    lastName = validator.checkName(lastName, "last name");
  } catch (e) {
    errors.push(e);
  }
  try {
    emailAddress = validator.checkEmail(emailAddress, "email address");
  } catch (e) {
    errors.push(e);
  }

  if (errors.length > 0) {
    event.preventDefault();
    alerts.innerHTML = errors.toString();
    return;
  }
}

function onSubmitPassword(event) {
  let errors = [];
  let password = passwordInput.value;
  let confirmPassword = confirmPasswordInput.value;
  try {
    password = validator.checkPassword(password, "password");
  } catch (e) {
    errors.push(e);
  }
  try {
    confirmPassword = validator.checkPassword(
      confirmPassword,
      "confirm password"
    );
  } catch (e) {
    errors.push(e);
  }
  if (password !== confirmPassword)
    errors.push("password does not match confirm password");

  if (errors.length > 0) {
    event.preventDefault();
    alerts.innerHTML = errors.toString();
    return;
  }
}

function setup() {
  profilePictureInput = document.getElementById("pictureUpload");
  userNameInput = document.getElementById("userNameInput");
  firstNameInput = document.getElementById("firstNameInput");
  lastNameInput = document.getElementById("lastNameInput");
  emailAddressInput = document.getElementById("emailAddressInput");
  passwordInput = document.getElementById("passwordInput");
  confirmPasswordInput = document.getElementById("confirmPasswordInput");
  alerts = document.getElementById("alerts");

  document
    .getElementById("pictureForm")
    .addEventListener("submit", onSubmitPicture);
  document.getElementById("infoForm").addEventListener("submit", onSubmitInfo);
  document
    .getElementById("passwordForm")
    .addEventListener("submit", onSubmitPassword);
}

document.addEventListener("DOMContentLoaded", setup);
