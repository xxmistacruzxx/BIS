import { Router } from "express";
import validator from "../validator.js";
import { userData } from "../data/index.js";
import xss from "xss"
const router = Router();

router.route("/").get(async (req, res) => {
  let params = {
    alerts: "",
    firstName: "",
    lastName: "",
    userName: "",
    emailAddress: "",
    password: "",
  };

  return res.render("register", params);
});

router.route("/").post(async (req, res) => {
  let firstName = req.body.firstNameInput;
  let lastName = req.body.lastNameInput;
  let userName = req.body.userNameInput;
  let emailAddress = req.body.emailAddressInput;
  let password = req.body.passwordInput;

  let errors = [];
  try {
    firstName = validator.checkName(xss(firstName), "firstName");
  } catch (e) {
    firstName = "";
    errors.push(e);
  }
  try {
    lastName = validator.checkName(xss(lastName), "lastName");
  } catch (e) {
    lastName = "";
    errors.push(e);
  }
  try {
    userName = validator.checkUserName(xss(userName), "userName");
  } catch (e) {
    userName = "";
    errors.push(e);
  }
  try {
    emailAddress = validator.checkEmail(xss(emailAddress), "emailAddress");
  } catch (e) {
    emailAddress = "";
    errors.push(e);
  }
  try {
    password = validator.checkPassword(xss(password), "password");
  } catch (e) {
    password = "";
    errors.push(e);
  }
  let l = {
    alerts: errors,
    firstName: firstName,
    lastName: lastName,
    userName: userName,
    emailAddress: emailAddress,
    password: password,
  };
  if (errors.length > 0) return res.status(400).render("register", l);

  let result;
  try {
    result = await userData.create(
      userName,
      password,
      emailAddress,
      firstName,
      lastName
    );
  } catch (e) {
    if (e.includes("username")) l.userName = "";
    else l.emailAddress = "";
    l.alerts.push(e);
    return res.status(400).render("register", l);
  }
  // console.log(`result: ${JSON.stringify(result)}`);

  if (!("_id" in result)) {
    l.alerts.push("Internal Server Error. Please try again.");
    return res.status(500).render("register", l);
  }

  return res.redirect("login?registration=success");
});

export default router;
