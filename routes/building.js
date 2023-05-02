import { Router } from "express";
import validator from "../validator.js";
import { buildingData, userData } from "../data/index.js";
const router = Router();

router.route("/:id").get(async (req, res) => {
  // basic error checks
  let userId = req.session.user._id;
  try {
    userId = validator.checkId(userId, "userId");
    await userData.get(userId);
  } catch (e) {
    res.status(401).json({ error: e });
  }
  let buildingId;
  try {
    buildingId = req.params.id;
    buildingId = validator.checkId(buildingId, "buildingId");
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  let building;
  try {
    building = await buildingData.get(buildingId);
  } catch (e) {
    return res.status(404).json({ error: "no building with that id" });
  }

  // check if user exists and if they have access to building id (is owner, manager, viewer, or building is public)
  if (
    !userData.hasViewerAccess(userId, "building", buildingId) ||
    building.public
  )
    return res.status(403).json({ error: "403: Forbidden" });

  // get building data and create html render
  let thisBuildingData = await buildingData.createExport(buildingId);
  let buildingLocation = `${thisBuildingData.address}, ${thisBuildingData.city} ${thisBuildingData.state}, ${thisBuildingData.zip}`;
  let mapLocation = buildingLocation.replace(" ", "+");
  let sER = await buildingData.createSubEntriesHtmlRender(buildingId);
  let canEdit = false;
  let canDelete = false;
  if (await userData.hasOwnerAccess(userId, "building", buildingId)) {
    canEdit = true;
    canDelete = true;
  } else if (await userData.hasEditAccess(userId, "building", buildingId)) {
    canEdit = true;
  }

  return res.render("building", {
    buildingName: thisBuildingData.name,
    buildingCreationDate: thisBuildingData.creationDate,
    buildingLocation: buildingLocation,
    buildingDescription: thisBuildingData.description,
    mapLocation: mapLocation,
    sER: sER,
    canEdit: canEdit,
    canDelete: canDelete,
    id: buildingId
  });
});

export default router;
