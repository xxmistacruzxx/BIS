import { Router } from "express";
import validator from "../validator.js";
import { roomData, buildingData, userData } from "../data/index.js";
const router = Router();

router.route("/:roomId").get(async (req, res) => {
  // basic error checks
  let userId = req.session.user._id;
  try {
    userId = validator.checkId(userId, "userId");
    await userData.get(userId);
  } catch(e) {
    res.status(401).json({ error: e });
  }
  let roomId;
  try {
    roomId = req.params.roomId;
    roomId = validator.checkId(roomId, "roomId");
  } catch(e) {
    return res.status(400).json({ error: e });
  }
  let room;
  try {
    room = await roomData.get(roomId);
  } catch(e) {
    return res.status(404).json({ error: "no room with that id" });
  }

  // get the room's building and check if user has access to that building id
  if (
    !userData.hasViewerAccess(userId, "room", roomId) &&
    !roomData.isPublic(roomId)
  )
    return res.status(403).json({ error: "403: Forbidden" });

  // todo: get room data and create html render
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
    sER: sER
  });
});

export default router;
