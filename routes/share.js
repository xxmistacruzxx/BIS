import { Router } from "express";
import validator from "../validator.js";
import { buildingData, userData } from "../data/index.js";
import xss from "xss"
const router = Router();

router.route("/:buildingId").get(async (req, res) => {
  let _id = req.session.user._id;
  try {
    _id = validator.checkId(_id, "user id");
  } catch (e) {
    return res.status(401).render("error", { code: 401, error: e });
  }
  let buildingId = req.params.buildingId;
  try {
    buildingId = validator.checkId(xss(buildingId), "building id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let building;
  try {
    building = await buildingData.get(buildingId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasOwnerAccess(_id, "building", buildingId);
  if (!access)
    return res
      .status(403)
      .render("error", { code: 403, error: "you don't own this building" });
  if (building.publicBuilding === true)
    return res
      .status(400)
      .render("error", { code: 400, error: "this building is already public" });
  let managePerm;
  try {
    managePerm = await buildingData.manageList(buildingId);
  } catch (e) {
    return res.status(500).render("error", { code: 500, error: e });
  }

  for (let i = 0; i < managePerm.length; i++) {
    managePerm[
      i
    ] = `${managePerm[i].userName} | <a href="/share/${buildingId}/removemanage/${managePerm[i].userName}">Remove</a>`;
  }
  let viewPerm = await buildingData.viewList(buildingId);
  for (let i = 0; i < viewPerm.length; i++) {
    viewPerm[
      i
    ] = `${viewPerm[i].userName} | <a href="/share/${buildingId}/removeview/${viewPerm[i].userName}">Remove</a>`;
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
  let _id = req.session.user._id;
  try {
    _id = validator.checkId(_id, "user id");
  } catch (e) {
    return res.status(401).render("error", { code: 401, error: e });
  }
  let buildingId = req.params.buildingId;
  try {
    buildingId = validator.checkId(xss(buildingId), "building id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let building;
  try {
    building = await buildingData.get(buildingId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let managePerm = await buildingData.manageList(buildingId);
  for (let i = 0; i < managePerm.length; i++) {
    managePerm[
      i
    ] = `${managePerm[i].userName} | <a href="/share/${buildingId}/removemanage/${managePerm[i].userName}">Remove</a>`;
  }
  let viewPerm = await buildingData.viewList(buildingId);
  for (let i = 0; i < viewPerm.length; i++) {
    viewPerm[
      i
    ] = `${viewPerm[i].userName} | <a href="/share/${buildingId}/removeview/${viewPerm[i].userName}">Remove</a>`;
  }
  let l = {
    buildingId: buildingId,
    buildingName: building.name,
    alerts: [],
    managePerm: managePerm,
    viewPerm: viewPerm,
  };
  let shareType;
  let userName;
  try {
    shareType = xss(req.body.shareType).trim();
    userName = xss(req.body.userNameInput);
  } catch (e) {
    l.alerts.push(e);
    return res.status(400).render("share", l);
  }

  if (shareType !== "manage" && shareType !== "view")
    return res.status(400).render("error", {
      code: 400,
      error: "shareType must be manage or view",
    });
  try {
    userName = validator.checkUserName(userName, "userName");
  } catch (e) {
    l.alerts.push(e);
    return res.status(400).render("share", l);
  }
  let user;
  try {
    user = await userData.getByUserName(userName);
  } catch (e) {
    l.alerts.push(e);
    return res.status(404).render("share", l);
  }
  let owner = await userData.get(_id);
  if (owner.userName === userName) {
    l.alerts.push("you cannot share with yourself");
    return res.status(400).render("share", l);
  }
  let access = await userData.hasViewerAccess(user._id, "building", buildingId);
  if (access) {
    l.alerts.push("this user already has an assigned permission.");
    return res.status(400).render("share", l);
  }
  let relation = "buildingViewAccess";
  if (shareType === "manage") relation = "buildingManageAccess";
  try {
    await userData.addBuildingRelation(user._id, relation, buildingId);
  } catch (e) {
    l.alerts.push(e);
    return res.status(500).render("share", l);
  }

  return res.redirect(`/share/${buildingId}`);
});

router.route("/:buildingId/removemanage/:userName").get(async (req, res) => {
  let _id = req.session.user._id;
  try {
    _id = validator.checkId(_id, "user id");
  } catch (e) {
    return res.status(401).render("error", { code: 401, error: e });
  }
  let buildingId = req.params.buildingId;
  try {
    buildingId = validator.checkId(xss(buildingId), "building id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let building;
  try {
    building = await buildingData.get(buildingId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let userNameToAdd = req.params.userName;
  try {
    userNameToAdd = validator.checkUserName(xss(userNameToAdd), "username");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let userToAdd;
  try {
    userToAdd = await userData.getByUserName(userNameToAdd);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasOwnerAccess(_id, "building", buildingId);
  if (!access) return res.status(403).render("error", { code: 403, error: e });
  if (building.publicBuilding === true)
    return res.status(400).render("error", { code: 400, error: e });
  if (!userToAdd.buildingManageAccess.includes(buildingId))
    return res.status(500).render("error", {
      code: 500,
      error: `user ${user.name} has no manage access to remove`,
    });

  try {
    await userData.removeBuildingRelation(
      userToAdd._id,
      "buildingManageAccess",
      buildingId
    );
  } catch (e) {
    return res.status(500).render("error", {
      code: 500,
      error: e.toString(),
    });
  }

  return res.redirect(`/share/${buildingId}`);
});

router.route("/:buildingId/removeview/:userName").get(async (req, res) => {
  let _id = req.session.user._id;
  try {
    _id = validator.checkId(_id, "user id");
  } catch (e) {
    return res.status(401).render("error", {
      code: 401,
      error: e,
    });
  }
  let buildingId = req.params.buildingId;
  try {
    buildingId = validator.checkId(xss(buildingId), "building id");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let building;
  try {
    building = await buildingData.get(buildingId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let userNameToAdd = req.params.userName;
  try {
    userNameToAdd = validator.checkUserName(xss(userNameToAdd), "username");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let userToAdd;
  try {
    userToAdd = await userData.getByUserName(userNameToAdd);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }
  let access = await userData.hasOwnerAccess(_id, "building", buildingId);
  if (!access)
    return res
      .status(403)
      .render("error", { code: 403, error: "you do not own this building" });
  if (building.publicBuilding === true)
    return res
      .status(400)
      .render("error", { code: 400, error: "this building is already punlic" });
  if (!userToAdd.buildingViewAccess.includes(buildingId))
    return res.status(400).render("error", {
      code: 400,
      error: `user ${user.name} has no manage access to remove`,
    });

  try {
    await userData.removeBuildingRelation(
      userToAdd._id,
      "buildingViewAccess",
      buildingId
    );
  } catch (e) {
    return res.status(500).render("error", {
      code: 500,
      error: e.toString(),
    });
  }

  return res.redirect(`/share/${buildingId}`);
});

export default router;
