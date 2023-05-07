import { Router } from "express";
import validator from "../validator.js";
import { userData, buildingData } from "../data/index.js";
const router = Router();

router.route("/:buildingId").get(async (req, res) => {
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
    buildingId = req.params.buildingId;
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

  if (!building.publicBuilding)
    return res
      .status(400)
      .json({ error: "you cannot favorite a private building" });

  let user = await userData.get(userId);
  if (!user.buildingFavorites.includes(buildingId))
    try {
      await userData.addBuildingRelation(
        userId,
        "buildingFavorites",
        buildingId
      );
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  else
    try {
      await userData.removeBuildingRelation(
        userId,
        "buildingFavorites",
        buildingId
      );
    } catch (e) {
      return res.status(500).json({ error: e });
    }

  return res.redirect(`/building/${building._id}`);
});

export default router;
