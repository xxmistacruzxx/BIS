import { Router } from "express";
import {
  buildingData,
  userData,
  roomData,
  containerData,
  itemData,
} from "../data/index.js";
import validator from "../validator.js";
import xss from "xss";
import axios from "axios";
const router = Router();

router.route("/building/:buildingId").get(async (req, res) => {
  // basic error check
  let buildingId = req.params.buildingId;
  try {
    buildingId = validator.checkId(xss(buildingId), "building id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let _id = req.session.user._id;
  let building;
  try {
    building = await buildingData.get(buildingId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasEditAccess(_id, "building", buildingId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have edit access to this building",
    });

  let l = {
    buildingId: buildingId,
    buildingName: building.name,
    buildingDescription: building.description,
    buildingAddress: building.address,
    buildingCity: building.city,
    buildingState: building.state,
    buildingZip: building.zip,
  };

  return res.render("editBuilding", l);
});

router.route("/building/:buildingId").post(async (req, res) => {
  let buildingId = req.params.buildingId;
  try {
    buildingId = validator.checkId(xss(buildingId), "building id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let _id = req.session.user._id;
  let building;
  try {
    building = await buildingData.get(buildingId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasEditAccess(_id, "building", buildingId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have edit access to this building",
    });

  let name = req.body.buildingNameInput;
  let description = req.body.buildingDescriptionInput;
  let address = req.body.buildingAddressInput;
  let city = req.body.buildingCityInput;
  let state = req.body.buildingStateInput;
  let zip = req.body.buildingZipInput;

  let errors = [];
  try {
    name = validator.checkString(xss(name), "building name");
    if (name.includes("-")) throw `cannot have a '-' symbol in the name`;
  } catch (e) {
    name = building.name;
    errors.push(e);
  }
  try {
    description = validator.checkString(
      xss(description),
      "building description"
    );
  } catch (e) {
    description = building.description;
    errors.push(e);
  }
  try {
    address = validator.checkString(xss(address), "building address");
  } catch (e) {
    address = building.address;
    errors.push(e);
  }
  try {
    city = validator.checkString(xss(city), "building city");
  } catch (e) {
    city = building.city;
    errors.push(e);
  }
  try {
    state = validator.checkString(xss(state), "building state");
  } catch (e) {
    state = building.state;
    errors.push(e);
  }
  try {
    zip = validator.checkString(xss(zip), "building zip");
  } catch (e) {
    if (
      e ===
      `${zip.trim()} is not a valid value for building zip as it only contains digits`
    )
      zip = zip.trim();
    else {
      zip = building.zip;
      errors.push(e);
    }
  }

  let sentData = JSON.stringify({
    address: {
      regionCode: "US",
      locality: city,
      administrativeArea: state,
      postalCode: zip,
      addressLines: [address],
    },
  });

  let config = {
    method: "post",
    url: `https://addressvalidation.googleapis.com/v1:validateAddress?key=${process.env.GOOGLE_API}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: sentData,
  };

  let l = {
    buildingId: buildingId,
    buildingName: name,
    buildingDescription: description,
    buildingAddress: address,
    buildingCity: city,
    buildingState: state,
    buildingZip: zip,
  };

  try {
    let response = await axios(config);
    let addressData = response.data;
    if ("error" in addressData)
      throw `failed to validate address. make sure address is correct and try again`;
    if (addressData.result.verdict.hasUnconfirmedComponents === true)
      throw `failed to validate address. make sure address is correct and try again`;
    addressData = addressData.result.address.postalAddress;
    address = addressData.addressLines[0];
    city = addressData.locality;
    state = addressData.administrativeArea;
    zip = addressData.postalCode;
  } catch (e) {
    errors.push(e);
    l.alerts = errors;
    return res.status(400).render("editBuilding", l);
  }

  if (errors.length > 0) {
    l.alerts = errors;
    return res.status(400).render("editBuilding", l);
  }

  l = {
    buildingId: buildingId,
    buildingName: name,
    buildingDescription: description,
    buildingAddress: address,
    buildingCity: city,
    buildingState: state,
    buildingZip: zip,
  };

  let updatedBuilding;
  try {
    updatedBuilding = await buildingData.updateBuildingProperties(buildingId, {
      name: name,
      description: description,
      address: address,
      city: city,
      state: state,
      zip: zip,
    });
  } catch (e) {
    // USER ERROR
    errors.push(e);
    l.alerts = errors;
    return res.status(400).render("editBuilding", l);
  }
  if (!("_id" in updatedBuilding)) {
    // DATABASE ERROR
    errors.push("Internal Server Error. Please try again.");
    l.alerts = errors;
    return res.status(500).render("editBuilding", l);
  }
  return res.redirect(`/building/${buildingId}`);
});

router.route("/room/:roomId").get(async (req, res) => {
  // basic error check
  let roomId = req.params.roomId;
  try {
    roomId = validator.checkId(xss(roomId), "room id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let _id = req.session.user._id;
  let room;
  try {
    room = await roomData.get(roomId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasEditAccess(_id, "room", roomId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have edit access to this room",
    });

  let l = {
    roomId: roomId,
    roomName: room.name,
    roomDescription: room.description,
  };

  return res.render("editRoom", l);
});

router.route("/room/:roomId").post(async (req, res) => {
  // basic error check
  let roomId = req.params.roomId;
  try {
    roomId = validator.checkId(xss(roomId), "room id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let _id = req.session.user._id;
  let room;
  try {
    room = await roomData.get(roomId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasEditAccess(_id, "room", roomId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have edit access to this room",
    });

  let name = req.body.roomNameInput;
  let description = req.body.roomDescriptionInput;
  let l = {
    roomId: roomId,
    roomName: name,
    roomDescription: description,
    roomCount: room.count,
    roomValue: room.value,
  };
  let errors = [];
  try {
    name = validator.checkString(xss(name), "name");
    if (name.includes("-")) throw `cannot have a '-' symbol in the name`;
  } catch (e) {
    l.roomName = room.name;
    errors.push(e);
  }
  try {
    description = validator.checkString(xss(description), "description");
  } catch (e) {
    l.roomDescription = room.description;
    errors.push(e);
  }

  if (errors.length > 0) {
    l.alerts = errors;
    return res.status(400).render("editRoom", l);
  }

  let updatedRoom;
  try {
    updatedRoom = await roomData.updateRoomProperty(roomId, {
      name: name,
      description: description,
    });
  } catch (e) {
    // USER ERROR
    errors.push(e);
    l.alerts = errors;
    return res.status(400).render("editRoom", l);
  }
  if (!("_id" in updatedRoom)) {
    // DATABASE ERROR
    errors.push("Internal Server Error. Please try again.");
    l.alerts = errors;
    return res.status(500).render("editRoom", l);
  }
  return res.redirect(`/room/${roomId}`);
});

router.route("/container/:containerId").get(async (req, res) => {
  // basic error check
  let containerId = req.params.containerId;
  try {
    containerId = validator.checkId(xss(containerId), "container id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let _id = req.session.user._id;
  let container;
  try {
    container = await containerData.get(containerId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasEditAccess(_id, "container", containerId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have edit access to this container",
    });

  let l = {
    containerId: containerId,
    containerName: container.name,
    containerDescription: container.description,
  };

  return res.render("editContainer", l);
});

router.route("/container/:containerId").post(async (req, res) => {
  // basic error check
  let containerId = req.params.containerId;
  try {
    containerId = validator.checkId(xss(containerId), "container id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let _id = req.session.user._id;
  let container;
  try {
    container = await containerData.get(containerId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasEditAccess(_id, "container", containerId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have edit access to this container",
    });

  let name = req.body.containerNameInput;
  let description = req.body.containerDescriptionInput;
  let l = {
    containerId: containerId,
    containerName: name,
    containerDescription: description,
    containerCount: container.count,
    containerValue: container.value,
  };
  let errors = [];
  try {
    name = validator.checkString(xss(name), "name");
    if (name.includes("-")) throw `cannot have a '-' symbol in the name`;
  } catch (e) {
    l.containerName = container.name;
    errors.push(e);
  }
  try {
    description = validator.checkString(xss(description), "description");
  } catch (e) {
    l.containerDescription = container.description;
    errors.push(e);
  }

  if (errors.length > 0) {
    l.alerts = errors;
    return res.status(400).render("editContainer", l);
  }

  let updatedContainer;
  try {
    updatedContainer = await containerData.updateContainerProperties(
      containerId,
      {
        name: name,
        description: description,
      }
    );
  } catch (e) {
    // USER ERROR
    errors.push(e);
    l.alerts = errors;
    return res.status(400).render("editContainer", l);
  }
  if (!("_id" in updatedContainer)) {
    // DATABASE ERROR
    errors.push("Internal Server Error. Please try again.");
    l.alerts = errors;
    return res.status(500).render("editContainer", l);
  }
  return res.redirect(`/container/${containerId}`);
});

router.route("/item/:itemId").get(async (req, res) => {
  // basic error check
  let itemId = req.params.itemId;
  try {
    itemId = validator.checkId(xss(itemId), "item id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let _id = req.session.user._id;
  let item;
  try {
    item = await itemData.get(itemId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasEditAccess(_id, "item", itemId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have edit access to this item",
    });

  let l = {
    itemId: itemId,
    itemName: item.name,
    itemDescription: item.description,
    itemCount: item.count,
    itemValue: item.value,
  };

  return res.render("editItem", l);
});

router.route("/item/:itemId").post(async (req, res) => {
  // basic error check
  let itemId = req.params.itemId;
  try {
    itemId = validator.checkId(itemId, "item id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let _id = req.session.user._id;
  let item;
  try {
    item = await itemData.get(itemId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasEditAccess(_id, "item", itemId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have edit access to this item",
    });

  let name = req.body.itemNameInput;
  let description = req.body.itemDescriptionInput;
  let l = {
    itemId: itemId,
    itemName: name,
    itemDescription: description,
    itemCount: item.count,
    itemValue: item.value,
  };
  let errors = [];
  try {
    name = validator.checkString(xss(name), "name");
    if (name.includes("-")) throw `cannot have a '-' symbol in the name`;
  } catch (e) {
    l.itemName = item.name;
    errors.push(e);
  }
  try {
    description = validator.checkString(xss(description), "description");
  } catch (e) {
    l.itemDescription = item.description;
    errors.push(e);
  }

  if (errors.length > 0) {
    l.alerts = errors;
    return res.status(400).render("editItem", l);
  }

  let updatedItem;
  try {
    updatedItem = await itemData.updateItemProperties(itemId, {
      name: name,
      description: description,
    });
  } catch (e) {
    // USER ERROR
    errors.push(e);
    l.alerts = errors;
    return res.status(400).render("editItem", l);
  }
  if (!("_id" in updatedItem)) {
    // DATABASE ERROR
    errors.push("Internal Server Error. Please try again.");
    l.alerts = errors;
    return res.status(500).render("editItem", l);
  }
  return res.redirect(`/item/${itemId}`);
});

router.route("/item/setcount/:itemId").post(async (req, res) => {
  // basic error check
  let itemId = req.params.itemId;
  try {
    itemId = validator.checkId(xss(itemId), "item id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let _id = req.session.user._id;
  let item;
  try {
    item = await itemData.get(itemId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasEditAccess(_id, "item", itemId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have edit access to this item",
    });

  let l = {
    itemId: itemId,
    itemName: item.name,
    itemDescription: item.description,
    itemCount: item.count,
    itemValue: item.value,
  };
  let errors = [];

  let count = req.body.itemCountInput;
  try {
    count = Number(xss(count));
    count = validator.checkInt(count, "count");
    if (count < 0) throw `can't have negative count`;
  } catch (e) {
    l.itemCount = "";
    errors.push(e);
  }

  if (errors.length > 0) {
    l.alerts = errors;
    return res.status(400).render("editItem", l);
  }

  try {
    await itemData.setCount(itemId, count);
  } catch (e) {
    errors.push(e);
    l.alerts = errors;
    return res.status(500).render("editItem", l);
  }

  return res.redirect(`/item/${itemId}`);
});

router.route("/item/setvalue/:itemId").post(async (req, res) => {
  // basic error check
  let itemId = req.params.itemId;
  try {
    itemId = validator.checkId(xss(itemId), "item id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let _id = req.session.user._id;
  let item;
  try {
    item = await itemData.get(itemId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasEditAccess(_id, "item", itemId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have edit access to this item",
    });

  let l = {
    itemId: itemId,
    itemName: item.name,
    itemDescription: item.description,
    itemCount: item.count,
    itemValue: item.value,
  };
  let errors = [];

  let value = req.body.itemValueInput;
  try {
    value = Number(xss(value));
    value = validator.checkNum(value, "value");
    if (value < 0) throw "can't have a negative value";
  } catch (e) {
    l.itemValue = "";
    errors.push(e);
  }

  if (errors.length > 0) {
    l.alerts = errors;
    return res.status(400).render("editItem", l);
  }

  try {
    await itemData.setValue(itemId, value);
  } catch (e) {
    errors.push(e);
    l.alerts = errors;
    return res.status(500).render("editItem", l);
  }

  return res.redirect(`/item/${itemId}`);
});

export default router;
