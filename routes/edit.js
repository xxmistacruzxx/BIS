import { Router } from "express";
import {
  buildingData,
  userData,
  roomData,
  containerData,
  itemData,
} from "../data/index.js";
import validator from "../validator.js";
const router = Router();

router.route("/building/:buildingId").get(async (req, res) => {
  // basic error check
  let buildingId = req.params.buildingId;
  try {
    buildingId = validator.checkId(buildingId, "building id");
  } catch (e) {
    return res.status(400).json({ error: "invalid building id" });
  }
  let _id = req.session.user._id;
  let building;
  try {
    building = await buildingData.get(buildingId);
  } catch (e) {
    return res.status(404).json({ error: e });
  }
  let access = await userData.hasEditAccess(_id, "building", buildingId);
  if (!access)
    return res
      .status(403)
      .json({ error: "you do not have edit access to this building" });

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
    buildingId = validator.checkId(buildingId, "building id");
  } catch (e) {
    return res.status(400).json({ error: "invald building id" });
  }
  let _id = req.session.user._id;
  let building;
  try {
    building = await buildingData.get(buildingId);
  } catch (e) {
    return res.status(404).json({ error: e });
  }
  let access = await userData.hasEditAccess(_id, "building", buildingId);
  if (!access)
    return res
      .status(403)
      .json({ error: "you do not have edit access to this building" });

  let name = req.body.buildingNameInput;
  let description = req.body.buildingDescriptionInput;
  let address = req.body.buildingAddressInput;
  let city = req.body.buildingCityInput;
  let state = req.body.buildingStateInput;
  let zip = req.body.buildingZipInput;

  let errors = [];
  try {
    name = validator.checkString(name, "building name");
  } catch (e) {
    name = building.name;
    errors.push(e);
  }
  try {
    description = validator.checkString(description, "building description");
  } catch (e) {
    description = building.description;
    errors.push(e);
  }
  try {
    address = validator.checkString(address, "building address");
  } catch (e) {
    address = building.address;
    errors.push(e);
  }
  try {
    city = validator.checkString(city, "building city");
  } catch (e) {
    city = building.city;
    errors.push(e);
  }
  try {
    state = validator.checkString(state, "building state");
  } catch (e) {
    state = building.state;
    errors.push(e);
  }
  try {
    zip = validator.checkString(zip, "building zip");
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

  let l = {
    buildingId: buildingId,
    buildingName: name,
    buildingDescription: description,
    buildingAddress: address,
    buildingCity: city,
    buildingState: state,
    buildingZip: zip,
  };
  if (errors.length > 0) {
    l.alerts = errors;
    return res.status(400).render("editBuilding", l);
  }

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
    roomId = validator.checkId(roomId, "room id");
  } catch (e) {
    return res.status(400).json({ error: "invalid room id" });
  }
  let _id = req.session.user._id;
  let room;
  try {
    room = await roomData.get(roomId);
  } catch (e) {
    return res.status(404).json({ error: e });
  }
  let access = await userData.hasEditAccess(_id, "room", roomId);
  if (!access)
    return res
      .status(403)
      .json({ error: "you do not have edit access to this room" });

  let l = {
    roomId: roomId,
    roomName: room.name,
    roomDescription: room.description,
  };

  return res.render("editRoom", l);
});

router.route("/room/:roomId").post(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.json({ error: "not implemented" });
});

router.route("/container/:containerId").get(async (req, res) => {
  // basic error check
  let containerId = req.params.containerId;
  try {
    containerId = validator.checkId(containerId, "container id");
  } catch (e) {
    return res.status(400).json({ error: "invalid container id" });
  }
  let _id = req.session.user._id;
  let container;
  try {
    container = await containerData.get(containerId);
  } catch (e) {
    return res.status(404).json({ error: e });
  }
  let access = await userData.hasEditAccess(_id, "container", containerId);
  if (!access)
    return res
      .status(403)
      .json({ error: "you do not have edit access to this container" });

  let l = {
    containerId: containerId,
    containerName: container.name,
    containerDescription: container.description,
  };

  return res.render("editContainer", l);
});

router.route("/container/:containerId").post(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.json({ error: "not implemented" });
});

router.route("/item/:itemId").get(async (req, res) => {
  // basic error check
  let itemId = req.params.itemId;
  try {
    itemId = validator.checkId(itemId, "item id");
  } catch (e) {
    return res.status(400).json({ error: "invalid item id" });
  }
  let _id = req.session.user._id;
  let item;
  try {
    item = await itemData.get(itemId);
  } catch (e) {
    return res.status(404).json({ error: e });
  }
  let access = await userData.hasEditAccess(_id, "item", itemId);
  if (!access)
    return res
      .status(403)
      .json({ error: "you do not have edit access to this item" });

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
  // TODO: IMPLEMENT ME
  return res.json({ error: "not implemented" });
});

router.route("/item/setcount/:itemId").post(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.json({ error: "not implemented" });
});

router.route("/item/setvalue/:itemId").post(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.json({ error: "not implemented" });
});

export default router;
