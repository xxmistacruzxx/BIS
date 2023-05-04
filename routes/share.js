import { Router } from "express";
import validator from "../validator.js";
import { buildingData, userData } from "../data/index.js";
const router = Router();

router.route("/:buildingId").get(async (req, res) => {
  let _id = req.session.user._id;
  try {
    _id = validator.checkId(_id, "user id");
  } catch (e) {
    return res.status(401).json({ error: "failed to authenticate user" });
  }
  let buildingId = req.params.buildingId;
  try {
    buildingId = validator.checkId(buildingId, "building id");
  } catch (e) {
    return res.status(400).json({ error: "invalid id" });
  }
  let building;
  try {
    building = await buildingData.get(buildingId);
  } catch (e) {
    return res.status(404).json({ error: "no building with that id" });
  }
  let access = await userData.hasOwnerAccess(_id, "building", buildingId);
  if (!access)
    return res.status(403).json({ error: "you do not own this building" });
  if (building.publicBuilding === true)
    return res.status(400).json({ error: "this building is already public" });

  // TODO: get list of current viewers and managers
  let managePerm = await buildingData.manageList(buildingId);
  for (let i = 0; i < managePerm.length; i++) {
    managePerm[i] = managePerm[i].userName;
  }
  let viewPerm = await buildingData.viewList(buildingId);
  for (let i = 0; i < viewPerm.length; i++) {
    viewPerm[i] = viewPerm[i].userName;
  }

  let l = {
    buildingId: buildingId,
    buildingName: building.name,
    managePerm: managePerm,
    viewPerm: viewPerm,
  };
  return res.render("share", l);
});

router.route("/:buildingId").post(async (req, res) => {
  return res.json({ error: "not implemented" });
});

export default router;
