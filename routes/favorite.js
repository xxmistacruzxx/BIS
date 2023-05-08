import { Router } from "express";
import validator from "../validator.js";
import { userData, buildingData } from "../data/index.js";
import xss from "xss"
const router = Router();

router.route("/:buildingId").get(async (req, res) => {
  // basic error checks
  let userId = req.session.user._id;
  try {
    userId = validator.checkId(userId, "userId");
    await userData.get(userId);
  } catch (e) {
    return res.status(401).render("error", { code: 401, error: e });
  }
  let buildingId;
  try {
    buildingId = xss(req.params.buildingId);
    buildingId = validator.checkId(buildingId, "buildingId");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let building;
  try {
    building = await buildingData.get(buildingId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }

  if (!building.publicBuilding)
    return res.status(400).render("error", {
      code: 400,
      error: "you cannot favorite private buildings",
    });

  let user = await userData.get(userId);
  if (!user.buildingFavorites.includes(buildingId))
    try {
      await userData.addBuildingRelation(
        userId,
        "buildingFavorites",
        buildingId
      );
    } catch (e) {
      return res.status(500).render("error", { code: 500, error: e });
    }
  else
    try {
      await userData.removeBuildingRelation(
        userId,
        "buildingFavorites",
        buildingId
      );
    } catch (e) {
      return res.status(500).render("error", { code: 500, error: e });
    }

  return res.redirect(`/building/${building._id}`);
});

export default router;
