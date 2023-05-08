import { Router } from "express";
import validator from "../validator.js";
import { roomData, buildingData, userData } from "../data/index.js";
import xss from "xss"
const router = Router();

router.route("/:roomId").get(async (req, res) => {
  // basic error checks
  let userId = req.session.user._id;
  try {
    userId = validator.checkId(userId, "userId");
    await userData.get(userId);
  } catch (e) {
    return res.status(401).render("error", { code: 401, error: e });
  }
  let roomId;
  try {
    roomId = xss(req.params.roomId);
    roomId = validator.checkId(roomId, "roomId");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let room;
  try {
    room = await roomData.get(roomId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }

  // get the room's building and check if user has access to that building id
  if (
    !(await userData.hasViewerAccess(userId, "room", roomId)) &&
    !(await roomData.isPublic(roomId))
  )
    return res.status(403).render("error", { code: 403, error: e });

  let thisRoomData = await roomData.createExport(roomId);
  let canEdit = false;
  let canDelete = false;
  if (await userData.hasOwnerAccess(userId, "room", roomId)) {
    canEdit = true;
    canDelete = true;
  } else if (await userData.hasEditAccess(userId, "room", roomId)) {
    canEdit = true;
  }
  let sER = await roomData.createSubEntriesHtmlRender(roomId);

  return res.render("room", {
    roomName: thisRoomData.name,
    roomDescription: thisRoomData.description,
    creationDate: thisRoomData.creationDate,
    containers: thisRoomData.containers,
    canEdit: canEdit,
    canDelete: canDelete,
    id: roomId,
    sER: sER,
  });
});

export default router;
