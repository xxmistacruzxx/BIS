let data;

function checkId(id, varName) {
  if (!id) throw `You must provide a ${varName}`;
  if (typeof id !== "string") throw `${varName} must be a string`;
  id = id.trim();
  if (id.length === 0)
    throw `${varName} cannot be an empty string or just spaces`;
  return id;
}

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

function checkInt(intVal, varName) {
  if (!intVal) throw `You must supply a ${varName}!`;
  if (typeof intVal !== "number") throw `${varName} must be an integer!`;
  if (Math.trunc(intVal) !== intVal) throw `${varName} must be an integer`;
  return intVal;
}

function checkNum(numVal, varName) {
  if (!numVal) throw `You must supply a ${varName}`;
  if (typeof numVal !== "number") throw `${varName} must be a number`;
  return numVal;
}

function checkName(name, varName) {
  name = this.checkString(name, varName);
  if (name.length < 3 || name.length > 25)
    throw `${varName} must be between 3 and 25 characters (inclusive)`;
  if (name.match(/[^a-zA-Z\-]/))
    throw `${varName} can only include letters and hyphens`;
  return name;
}

function buildingOptions() {
  let options = [];
  for (i of data.buildingOwnership) {
    options.push({ _id: i._id, name: i.name });
  }
  for (i of data.buildingManageAccess) {
    options.push({ _id: i._id, name: i.name });
  }
  return options;
}

function buildingOptionsRender() {
  let render = `<option value="" disabled selected>Select your option...</option>`;
  let options = buildingOptions();
  for (i of options) {
    render = render + `<option value="${i._id}">${i.name} - ${i._id}</option>`;
  }
  return render;
}

function roomOptions() {
  let selectedBuilding = $("#buildingInput").val();
  let building;
  let options = [];
  for (i of data.buildingOwnership) {
    if (i._id === selectedBuilding) building = i;
  }
  for (i of data.buildingManageAccess) {
    if (i._id === selectedBuilding) building = i;
  }
  if (building === undefined) return options;
  for (i of building.rooms) {
    options.push({ _id: i._id, name: i.name });
  }
  return options;
}

function roomOptionsRender() {
  let render = `<option value="" disabled selected>Select your option...</option>`;
  let options = roomOptions();
  for (i of options) {
    render = render + `<option value="${i._id}">${i.name} - ${i._id}</option>`;
  }
  return render;
}

function containerOptions() {
  let selectedBuilding = $("#buildingInput").val();
  let building;
  let selectedRoom = $("#roomInput").val();
  let room;
  let options = [];
  for (i of data.buildingOwnership) {
    if (i._id === selectedBuilding) building = i;
  }
  for (i of data.buildingManageAccess) {
    if (i._id === selectedBuilding) building = i;
  }
  if (building === undefined) return options;
  for (i of building.rooms) {
    if (i._id === selectedRoom) room = i;
  }
  if (room === undefined) return options;
  for (i of room.containers) {
    options.push({ _id: i._id, name: i.name });
  }
  return options;
}

function containerOptionsRender() {
  let render = `<option value="" selected>None</option>`;
  let options = containerOptions();
  for (i of options) {
    render = render + `<option value="${i._id}">${i.name} - ${i._id}</option>`;
  }
  return render;
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

function addBuilding() {
  let errors = [];
  try {
    let buildingNameInput = document.querySelector(
      "#addBuildingNameInput"
    ).value;
    buildingNameInput = checkString(buildingNameInput, "Building Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    let buildingDescriptionInput = document.querySelector(
      "#addBuildingDescriptionInput"
    ).value;
    buildingDescriptionInput = checkString(
      buildingDescriptionInput,
      "Building Description"
    );
  } catch (e) {
    errors.push(e);
  }
  try {
    let buildingAddressInput = document.querySelector(
      "#addBuildingAddressInput"
    ).value;
    buildingAddressInput = checkString(
      buildingAddressInput,
      "Building Address"
    );
  } catch (e) {
    errors.push(e);
  }
  try {
    let buildingCityInput = document.querySelector(
      "#addBuildingCityInput"
    ).value;
    buildingCityInput = checkString(buildingCityInput, "Building City");
  } catch (e) {
    errors.push(e);
  }
  try {
    let buildingStateInput = document.querySelector(
      "#addBuildingStateInput"
    ).value;
    buildingStateInput = checkString(buildingStateInput, "Building State");
  } catch (e) {
    errors.push(e);
  }
  try {
    let buildingZipInput = document.querySelector("#addBuildingZipInput").value;
    buildingZipInput = checkString(buildingZipInput, "Building Zip");
  } catch (e) {
    if (
      e ===
      `${buildingZipInput.trim()} is not a valid value for zip as it only contains digits`
    )
      zip = zip.trim();
    else errors.push(e);
  }
  try {
    let buildingPublicInput = document
      .querySelector("#addBuildingPublicInput")
      .value.trim();
    if (buildingPublicInput !== "true" && buildingPublicInput !== "false")
      throw `Building publicity must be true or false`;
  } catch (e) {
    errors.push(e);
  }

  if (errors.length > 0) {
    setAlerts(errors);
    return false;
  }
  return true;
}

function addRoom() {
  let errors = [];
  try {
    let buildingId = $("#buildingInput").val();
    buildingId = checkId(buildingId, "buildingId");
  } catch (e) {
    errors.push(e);
  }

  try {
    let roomNameInput = document.querySelector("#addRoomNameInput").value;
    roomNameInput = checkString(roomNameInput, "Room Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    let roomDescriptionInput = document.querySelector(
      "#addRoomDescriptionInput"
    ).value;
    roomDescriptionInput = checkString(
      roomDescriptionInput,
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

function addContainer() {
  let errors = [];
  try {
    let buildingId = $("#buildingInput").val();
    buildingId = checkId(buildingId, "buildingId");
  } catch (e) {
    errors.push(e);
  }
  try {
    let roomId = $("#roomInput").val();
    roomId = checkId(roomId, "roomId");
  } catch (e) {
    errors.push(e);
  }

  try {
    let containerNameInput = document.querySelector(
      "#addContainerNameInput"
    ).value;
    containerNameInput = checkString(containerNameInput, "Container Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    let containerDescriptionInput = document.querySelector(
      "#addContainerDescriptionInput"
    ).value;
    containerDescriptionInput = checkString(
      containerDescriptionInput,
      "Container Description"
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

function addItem() {
  let errors = [];
  try {
    let buildingId = $("#buildingInput").val();
    buildingId = checkId(buildingId, "buildingId");
  } catch (e) {
    errors.push(e);
  }
  try {
    let roomId = $("#roomInput").val();
    roomId = checkId(roomId, "roomId");
  } catch (e) {
    errors.push(e);
  }
  try {
    let containerId = $("#containerInput").val().trim();
    if (containerId !== "") containerId = checkId(containerId, "containerId");
  } catch (e) {
    errors.push(e);
  }
  try {
    let itemNameInput = document.querySelector("#addItemNameInput").value;
    itemNameInput = checkString(itemNameInput, "Item Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    let itemDescriptionInput = document.querySelector(
      "#addItemDescriptionInput"
    ).value;
    itemDescriptionInput = checkString(
      itemDescriptionInput,
      "Item Description"
    );
  } catch (e) {
    errors.push(e);
  }
  try {
    let itemCountInput = document.querySelector("#addItemCountInput").value;
    itemCountInput = checkInt(parseInt(itemCountInput, 10), "Item Count");
  } catch (e) {
    errors.push(e);
  }
  try {
    let itemValueInput = document.querySelector("#addItemValueInput").value;
    itemValueInput = checkNum(Number(itemValueInput), "Item Value");
  } catch (e) {
    errors.push(e);
  }

  if (errors.length > 0) {
    setAlerts(errors);
    return false;
  }
  return true;
}

/**
 * listener for thingToAddInputChange to hide/show elements irrelevant and releveant elements, respectively.
 * @param {*} e
 */
function thingToAddInputChange(e) {
  let buildingSelectorDiv = document.querySelector("#buildingSelectorDiv");
  let roomSelectorDiv = document.querySelector("#roomSelectorDiv");
  let containerSelectorDiv = document.querySelector("#containerSelectorDiv");

  let addBuildingDiv = document.querySelector("#addBuildingDiv");
  let addRoomDiv = document.querySelector("#addRoomDiv");
  let addContainerDiv = document.querySelector("#addContainerDiv");
  let addItemDiv = document.querySelector("#addItemDiv");

  let buildingInput = document.querySelector("#buildingInput");
  let containerInput = document.querySelector("#containerInput");

  let dividerDiv = document.querySelector("#dividerDiv");
  let submitButtonDiv = document.querySelector("#submitButtonDiv");

  let divs = [
    buildingSelectorDiv,
    roomSelectorDiv,
    containerSelectorDiv,
    addBuildingDiv,
    addRoomDiv,
    addContainerDiv,
    addItemDiv,
    dividerDiv,
    submitButtonDiv
  ];

  for (i of divs) {
    i.hidden = true;
  }

  let thingToAddInputValue = $("#thingToAddInput").val();
  switch (thingToAddInputValue) {
    case "building":
      addBuildingDiv.hidden = false;
      dividerDiv.hidden = false;
      submitButtonDiv.hidden = false;
      break;
    case "room":
      buildingSelectorDiv.hidden = false;
      buildingInput.innerHTML = buildingOptionsRender();
      addRoomDiv.hidden = false;
      dividerDiv.hidden = false;
      submitButtonDiv.hidden = false;
      break;
    case "container":
      buildingSelectorDiv.hidden = false;
      buildingInput.innerHTML = buildingOptionsRender();
      roomSelectorDiv.hidden = false;
      addContainerDiv.hidden = false;
      dividerDiv.hidden = false;
      submitButtonDiv.hidden = false;
      break;
    case "item":
      buildingSelectorDiv.hidden = false;
      buildingInput.innerHTML = buildingOptionsRender();
      roomSelectorDiv.hidden = false;
      containerSelectorDiv.hidden = false;
      addItemDiv.hidden = false;
      dividerDiv.hidden = false;
      submitButtonDiv.hidden = false;
      break;
    default:
      break;
  }
  return;
}

function buildingInputChange(e) {
  let roomInput = document.querySelector("#roomInput");
  roomInput.innerHTML = roomOptionsRender();
  let containerInput = document.querySelector("#containerInput");
  containerInput.innerHTML = `<option value="" selected>None</option>`;
}

function roomInputChange(e) {
  let containerInput = document.querySelector("#containerInput");
  containerInput.innerHTML = containerOptionsRender();
}

function submitButton(e) {
  let thingToAddValue = $("#thingToAddInput").val();
  let alerts = document.querySelector("#alerts");
  let passedErrors = false;
  switch (thingToAddValue) {
    case "building":
      passedErrors = addBuilding();
      break;
    case "room":
      passedErrors = addRoom();
      break;
    case "container":
      passedErrors = addContainer();
      break;
    case "item":
      passedErrors = addItem();
      break;
    default:
      alerts.innerHTML = "<li>No add type selected.</li>";
      e.preventDefault();
      break;
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
  document
    .querySelector("#thingToAddInput")
    .addEventListener("change", thingToAddInputChange);
  document
    .querySelector("#buildingInput")
    .addEventListener("change", buildingInputChange);
  document
    .querySelector("#roomInput")
    .addEventListener("change", roomInputChange);
}

document.addEventListener("DOMContentLoaded", setup);
