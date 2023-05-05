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
  let shareType = req.body.shareType.trim();
  let userName = req.body.userNameInput;
  if (shareType !== "manage" && shareType !== "view")
    return res.status(400).json({ error: "shareType must be manage or view" });
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
  let userNameToAdd = req.params.userName;
  try {
    userNameToAdd = validator.checkUserName(userNameToAdd, "username");
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  let userToAdd;
  try {
    userToAdd = await userData.getByUserName(userNameToAdd);
  } catch (e) {
    return res.status(404).json({ error: e });
  }
  let access = await userData.hasOwnerAccess(_id, "building", buildingId);
  if (!access)
    return res.status(403).json({ error: "you do not own this building" });
  if (building.publicBuilding === true)
    return res.status(400).json({ error: "this building is already public" });
  if (!userToAdd.buildingManageAccess.includes(buildingId))
    return res
      .status(400)
      .json({ error: `user ${user.name} has no manage access to remove` });

  try {
    await userData.removeBuildingRelation(
      userToAdd._id,
      "buildingManageAccess",
      buildingId
    );
  } catch (e) {
    return res.status(500).json({
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
  let userNameToAdd = req.params.userName;
  try {
    userNameToAdd = validator.checkUserName(userNameToAdd, "username");
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  let userToAdd;
  try {
    userToAdd = await userData.getByUserName(userNameToAdd);
  } catch (e) {
    return res.status(404).json({ error: e });
  }
  let access = await userData.hasOwnerAccess(_id, "building", buildingId);
  if (!access)
    return res.status(403).json({ error: "you do not own this building" });
  if (building.publicBuilding === true)
    return res.status(400).json({ error: "this building is already public" });
  if (!userToAdd.buildingViewAccess.includes(buildingId))
    return res
      .status(400)
      .json({ error: `user ${user.name} has no manage access to remove` });

  try {
    await userData.removeBuildingRelation(
      userToAdd._id,
      "buildingViewAccess",
      buildingId
    );
  } catch (e) {
    return res.status(500).json({
      error: e.toString(),
    });
  }

  return res.redirect(`/share/${buildingId}`);
});

export default router;
