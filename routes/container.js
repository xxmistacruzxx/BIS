import { Router } from "express";
import { containerData, userData } from "../data/index.js";
import validator from "../validator.js"
import xss from "xss"
const router = Router();

router.route("/:containerId").get(async (req, res) => {
  // basic error checks
  let userId = req.session.user._id;
  try {
    userId = validator.checkId(userId, "userId");
    await userData.get(userId);
  } catch (e) {
    return res.status(401).render("error", { code: 401, error: e });
  }
  let containerId;
  try {
    containerId = xss(req.params.containerId);
    containerId = validator.checkId(containerId, "containerId");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let container;
  try {
    container = await containerData.get(containerId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }

  // get the container's building and check if user has access to that building id
  if (
    !await userData.hasViewerAccess(userId, "container", containerId) &&
    !await containerData.isPublic(containerId)
  )
  return res.status(403).render("error", { code: 403, error: "You do not have access to this container." });

  // todo: get container data and create html render
  let thisContainerData = await containerData.createExport(containerId);
  let canEdit = false;
  let canDelete = false;
  if (await userData.hasOwnerAccess(userId, "container", containerId)) {
    canEdit = true;
    canDelete = true;
  } else if (await userData.hasEditAccess(userId, "container", containerId)) {
    canEdit = true;
  }
  let sER = await containerData.createSubEntriesHtmlRender(containerId);

  return res.render("container", {
    id: containerId,
    containerName: thisContainerData.name,
    creationDate: thisContainerData.creationDate,
    containerDescription: thisContainerData.description,
    canEdit: canEdit,
    canDelete: canDelete,
    sER: sER,
  });
});

export default router;
