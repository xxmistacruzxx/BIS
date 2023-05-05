import { Router } from "express";
import {
  userData,
  buildingData,
  roomData,
  containerData,
  itemData,
} from "../data/index.js";
import validator from "../validator.js";
const router = Router();

router.route("/").get(async (req, res) => {
  let uid = req.session.user._id;
  let user = await userData.get(uid);

  return res.render("add");
});

router.route("/").post(async (req, res) => {
  let thingToAdd = req.body.thingToAddInput;
  let uid = req.session.user._id;
  let id;
  let errors = [];
  switch (thingToAdd) {
    // ADD BUILDING
    case "building":
      // BASIC ERROR CHECK
      let buildingName = req.body.addBuildingNameInput,
        buildingDescription = req.body.addBuildingDescriptionInput,
        buildingAddress = req.body.addBuildingAddressInput,
        buildingCity = req.body.addBuildingCityInput,
        buildingState = req.body.addBuildingStateInput,
        buildingZip = req.body.addBuildingZipInput,
        buildingPublic = req.body.addBuildingPublicInput.trim().toLowerCase();
      try {
        buildingName = validator.checkString(buildingName, "buildingName");
      } catch (e) {
        errors.push(e);
      }
      try {
        buildingDescription = validator.checkString(
          buildingDescription,
          "buildingDescription"
        );
      } catch (e) {
        errors.push(e);
      }
      try {
        buildingAddress = validator.checkString(
          buildingAddress,
          "buildingAddress"
        );
      } catch (e) {
        errors.push(e);
      }
      try {
        buildingCity = validator.checkString(buildingCity, "buildingCity");
      } catch (e) {
        errors.push(e);
      }
      try {
        buildingState = validator.checkString(buildingState, "buildingState");
      } catch (e) {
        errors.push(e);
      }
      try {
        buildingZip = validator.checkString(buildingZip, "buildingZip");
      } catch (e) {
        if (
          e ===
          `${buildingZip.trim()} is not a valid value for buildingZip as it only contains digits`
        )
          buildingZip = buildingZip.trim();
        else errors.push(e);
      }
      try {
        if (buildingPublic === "true") buildingPublic = true;
        else if (buildingPublic === "false") buildingPublic = false;
        else throw `building publicity must be true or false`;
      } catch (e) {
        errors.push(e);
      }

      if (errors.length > 0) {
        return res.status(400).render("add", { alerts: errors });
      }
      // CREATE NEW BUILDING
      let newBuilding;
      try {
        newBuilding = await buildingData.create(
          uid,
          buildingName,
          buildingDescription,
          buildingAddress,
          buildingCity,
          buildingState,
          buildingZip,
          buildingPublic
        );
      } catch (e) {
        // USER ERROR
        errors.push(e);
        return res.status(400).render("add", { alerts: errors });
      }
      if (!("_id" in newBuilding)) {
        // DATABASE ERROR
        errors.push("Internal Server Error. Please try again.");
        return res.status(500).render("add", { alerts: errors });
      }
      return res.redirect(`/building/${newBuilding._id}`);

    // ADD ROOM
    case "room":
      // BASIC ERROR CHECK
      let buildingId = req.body.buildingInput,
        roomName = req.body.addRoomNameInput,
        roomDescription = req.body.addRoomDescriptionInput;
      try {
        buildingId = validator.checkId(buildingId, "buildingId");
      } catch (e) {
        errors.push(e);
      }
      try {
        roomName = validator.checkString(roomName, "roomName");
      } catch (e) {
        errors.push(e);
      }
      try {
        roomDescription = validator.checkString(
          roomDescription,
          "roomDescription"
        );
      } catch (e) {
        errors.push(e);
      }

      if (errors.length > 0) {
        return res.status(400).render("add", { alerts: errors });
      }
      // CREATE NEW ROOM
      let newRoom;
      try {
        newRoom = await roomData.create(buildingId, roomName, roomDescription);
      } catch (e) {
        // USER ERROR
        errors.push(e);
        return res.status(400).render("add", { alerts: errors });
      }
      if (!("_id" in newRoom)) {
        // DATABASE ERROR
        errors.push("Internal Server Error. Please try again.");
        return res.status(500).render("add", { alerts: errors });
      }
      return res.redirect(`/room/${newRoom._id}`);
    // ADD CONTAINER
    case "container":
      // BASIC ERROR CHECK
      let roomId = req.body.roomInput,
        containerName = req.body.addContainerNameInput,
        containerDescription = req.body.addContainerDescriptionInput;
      try {
        roomId = validator.checkId(roomId, "roomId");
      } catch (e) {
        errors.push(e);
      }
      try {
        containerName = validator.checkString(containerName, "containerName");
      } catch (e) {
        errors.push(e);
      }
      try {
        containerDescription = validator.checkString(
          containerDescription,
          "containerDescription"
        );
      } catch (e) {
        errors.push(e);
      }

      if (errors.length > 0) {
        return res.status(400).render("add", { alerts: errors });
      }
      // CREATE NEW CONTAINER
      let newContainer;
      try {
        newContainer = await containerData.create(
          roomId,
          containerName,
          containerDescription
        );
      } catch (e) {
        // USER ERROR
        errors.push(e);
        return res.status(400).render("add", { alerts: errors });
      }
      if (!("_id" in newContainer)) {
        // DATABASE ERROR
        errors.push("Internal Server Error. Please try again.");
        return res.status(500).render("add", { alerts: errors });
      }
      return res.redirect(`/container/${newContainer._id}`);
    // ADD ITEM
    case "item":
      // BASIC ERROR CHECK
      let roomId2 = req.body.roomInput,
        containerId = req.body.containerInput,
        itemName = req.body.addItemNameInput,
        itemDescription = req.body.addItemDescriptionInput,
        itemCount = req.body.addItemCountInput,
        itemValue = req.body.addItemValueInput;

      let whereToAdd;
      let id;
      try {
        roomId2 = validator.checkId(roomId2, "roomId");
      } catch (e) {
        errors.push(e);
      }
      try {
        if (containerId.trim() !== "") {
          containerId = validator.checkId(containerId, "containerId");
          whereToAdd = "container";
          id = containerId;
        } else {
          whereToAdd = "room";
          id = roomId2;
        }
      } catch (e) {
        errors.push(e);
      }
      try {
        itemName = validator.checkString(itemName, "itemName");
      } catch (e) {
        errors.push(e);
      }
      try {
        itemDescription = validator.checkString(
          itemDescription,
          "itemDescription"
        );
      } catch (e) {
        errors.push(e);
      }
      try {
        itemCount = parseInt(itemCount, 10);
        itemCount = validator.checkInt(itemCount, "itemCount");
      } catch (e) {
        errors.push(e);
      }
      try {
        itemValue = Number(itemValue);
        itemValue = validator.checkInt(itemValue, "itemValue");
      } catch (e) {
        errors.push(e);
      }

      if (errors.length > 0) {
        return res.status(400).render("add", { alerts: errors });
      }
      // CREATE NEW ITEM
      let newItem;
      try {
        newItem = await itemData.create(
          id,
          whereToAdd,
          itemName,
          itemDescription,
          itemCount,
          itemValue
        );
      } catch (e) {
        // USER ERROR
        errors.push(e);
        return res.status(400).render("add", { alerts: errors });
      }
      if (!("_id" in newItem)) {
        // DATABASE ERROR
        errors.push("Internal Server Error. Please try again.");
        return res.status(500).render("add", { alerts: errors });
      }
      return res.redirect(`/item/${newItem._id}`);
    default:
      return res.status(400).render("add", {
        alerts: [`"${thingToAdd}" is an invalid thing to add.`],
      });
  }
});

export default router;
