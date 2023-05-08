import { Router } from "express";
import {
  userData,
  buildingData,
  roomData,
  containerData,
} from "../data/index.js";
import validator from "../validator.js";
import xss from "xss"
const router = Router();

router.route("/building/:buildingId").get(async (req, res) => {
  // basic error checks
  let buildingId = req.params.buildingId;
  try {
    buildingId = validator.checkId(xss(buildingId), "building id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  // check if user can delete building
  let _id = req.session.user._id;
  let access = await userData.hasOwnerAccess(_id, "building", buildingId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have access to this building",
    });
  // get building
  let building;
  try {
    building = await buildingData.get(buildingId);
  } catch (e) {
    return res.status(500).render("error", { code: 500, error: e });
  }
  // render page
  return res.render("delete", {
    type: "building",
    name: building.name,
    id: buildingId,
  });
});

router.route("/building/:buildingId").post(async (req, res) => {
  // basic error checks
  let buildingId = req.params.buildingId;
  try {
    buildingId = validator.checkId(xss(buildingId), "building id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  // check if user can delete building
  let _id = req.session.user._id;
  let access = await userData.hasOwnerAccess(_id, "building", buildingId);
  if (!access)
    return res.status(400).render("error", {
      code: 403,
      error: "you do not have owner access to this building",
    });

  //delete building
  try {
    await buildingData.remove(buildingId);
  } catch (e) {
    return res.status(500).render("error", { code: 500, error: e });
  }

  return res.redirect("/");
});

router.route("/room/:roomId").get(async (req, res) => {
  // basic error checks
  let roomId = req.params.roomId;
  try {
    roomId = validator.checkId(xss(roomId), "room id");
  } catch (e) {
    return res.status(400).json({ error: "invalid id" });
  }
  // check if user can delete room
  let _id = req.session.user._id;
  let access = await userData.hasOwnerAccess(_id, "room", roomId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have owner access to this room",
    });
  // get room
  let room;
  try {
    room = await roomData.get(roomId);
  } catch (e) {
    return res.status(500).render("error", { code: 500, error: e });
  }
  // render page
  return res.render("delete", {
    type: "room",
    name: room.name,
    id: roomId,
  });
});

router.route("/room/:roomId").post(async (req, res) => {
  // basic error checks
  let roomId = req.params.roomId;
  try {
    roomId = validator.checkId(xss(roomId), "room id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  // check if user can delete room
  let _id = req.session.user._id;
  let access = await userData.hasOwnerAccess(_id, "room", roomId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have owner access to this room",
    });
  //delete room
  try {
    await roomData.remove(roomId);
  } catch (e) {
    return res.status(500).render("error", { code: 500, error: e });
  }

  return res.redirect("/");
});

router.route("/container/:containerId").get(async (req, res) => {
  // basic error checks
  let containerId = req.params.containerId;
  try {
    containerId = validator.checkId(xss(containerId), "container id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  // check if user can delete container
  let _id = req.session.user._id;
  let access = await userData.hasOwnerAccess(_id, "container", containerId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have owner access to this container",
    });
  // get container
  let container;
  try {
    container = await containerData.get(containerId);
  } catch (e) {
    return res.status(500).render("error", { code: 500, error: e });
  }
  // render page
  return res.render("delete", {
    type: "container",
    name: container.name,
    id: containerId,
  });
});

router.route("/container/:containerId").post(async (req, res) => {
  // basic error checks
  let containerId = req.params.containerId;
  try {
    containerId = validator.checkId(xss(containerId), "container id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  // check if user can delete container
  let _id = req.session.user._id;
  let access = await userData.hasOwnerAccess(_id, "container", containerId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have owner access to this room",
    });
  //delete container
  try {
    await containerData.remove(containerId);
  } catch (e) {
    return res.status(500).render("error", { code: 500, error: e });
  }

  return res.redirect("/");
});

router.route("/item/:itemId").get(async (req, res) => {
  // basic error checks
  let itemId = req.params.itemId;
  try {
    itemId = validator.checkId(xss(itemId), "item id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  // check if user can delete item
  let _id = req.session.user._id;
  let access = await userData.hasOwnerAccess(_id, "item", itemId);
  if (!access)
    return res.status(403).render("error", {
      code: 403,
      error: "you do not have owner access to this item",
    });
  // get item
  let item;
  try {
    item = await itemData.get(itemId);
  } catch (e) {
    return res.status(500).render("error", { code: 500, error: e });
  }
  // render page
  return res.render("delete", {
    type: "item",
    name: item.name,
    id: itemId,
  });
});

router.route("/item/:itemId").post(async (req, res) => {
  // basic error checks
  let itemId = req.params.itemId;
  try {
    itemId = validator.checkId(xss(itemId), "item id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  // check if user can delete item
  let _id = req.session.user._id;
  let access = await userData.hasOwnerAccess(_id, "item", itemId);
  if (!access)
    return res
      .status(403)
      .render("error", {
        code: 403,
        error: "you do not have owner access to this item",
      });
  //delete item
  try {
    await itemData.remove(itemId);
  } catch (e) {
    return res.status(500).render("error", { code: 500, error: e });
  }

  return res.redirect("/");
});

export default router;
