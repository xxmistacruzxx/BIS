import { Router } from "express";
import validator from "../validator.js";
import { userData } from "../data/index.js";
import xss from "xss"
const router = Router();

router.route("/").get(async (req, res) => {
  let params = { success: false, alerts: [], userName: "", password: "" };
  if (req.query.registration) params.success = true;

  return res.render("login", params);
});

router.route("/").post(async (req, res) => {
  let userName = req.body.userNameInput;
  let password = req.body.passwordInput;

  let errors = [];
  try {
    userName = validator.checkUserName(xss(userName), "username");
  } catch (e) {
    errors.push(e);
    userName = "";
  }
  try {
    password = validator.checkPassword(xss(password), "password");
  } catch (e) {
    errors.push(e);
    password = "";
  }

  let l = { alerts: errors, userName: userName, password: password };
  if (errors.length > 0) return res.status(400).render("login", l);

  let result;
  try {
    result = await userData.authUser(userName, password);
  } catch (e) {
    if (e.toString().includes("userName")) l.userName = "";
    l.password = "";
    l.alerts.push(e);
    return res.status(400).render("login", l);
  }
  if (!("_id" in result)) {
    l.alerts.push("Internal Server Error. Please try again.");
    return res.status(500).render("login", l);
  }

  // set session
  req.session.user = {
    _id: result._id,
  };

  return res.redirect("/profile");
});

export default router;
