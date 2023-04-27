import { Router } from "express";
import { userData } from "../data/index.js";
import validator from "../validator.js";
const router = Router();

router.route("/").get(async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  let _id = req.session.user._id;
  let user;
  try {
    user = await userData.get(_id);
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again." });
  }
  let l = {
    profilePicture: user.profilePicture,
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
    emailAddress: user.email,
  };
  return res.render("myProfile", l);
});

router.route("/:userName").get(async (req, res) => {
  let userName;
  try {
    userName = req.params.userName;
    userName = validator.checkUserName(userName, "id");
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  let user;
  try {
    user = await userData.getByUserName(userName);
  } catch (e) {
    return res.status(404).json({ error: "User not found" });
  }
  let l = {
    userName: user.userName,
    profilePicture: user.profilePicture,
    firstName: user.firstName,
    lastName: user.lastName,
  };
  return res.render("profile", l);
});

export default router;
