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

router.route("/").post(async (req, res) => {
  const formType = req.body.formType;
  let _id = req.session.user._id;
  let user = await userData.get(_id);
  let errors = [];

  // CHANGE PASSWORD FORM
  if (formType === "password") {
    let l = {
      profilePicture: user.profilePicture,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      emailAddress: user.email,
    };
    // basic error checks
    let password = req.body.passwordInput;
    try {
      password = validator.checkPassword(password, "password");
    } catch (e) {
      errors.push(e);
    }

    if (errors.length > 0) {
      l.alerts = errors;
      return res.status(400).render("myProfile", l);
    }

    // update password in database
    try {
      await userData.updateUserProperties(_id, {
        password: password,
      });
      l.alerts = ["Password set successfully."];
      return res.render("myProfile", l);
    } catch (e) {
      errors.push(e);
      l.alerts = errors;
      return res.status(500).render("myProfile", l);
    }
  }

  // CHANGE USER INFO FORM
  if (formType === "userInfo") {
    let l = {
      profilePicture: user.profilePicture,
      firstName: req.body.firstNameInput,
      lastName: req.body.lastNameInput,
      userName: req.body.userNameInput,
      emailAddress: req.body.emailAddressInput,
    };
    // basic error checks
    try {
      l.firstName = validator.checkName(l.firstName, "first name");
    } catch (e) {
      errors.push(e);
      l.firstName = user.firstName;
    }
    try {
      l.lastName = validator.checkName(l.lastName, "first name");
    } catch (e) {
      errors.push(e);
      l.lastName = user.lastName;
    }
    try {
      l.userName = validator.checkUserName(l.userName, "username");
    } catch (e) {
      errors.push(e);
      l.userName = user.userName;
    }
    try {
      l.emailAddress = validator.checkEmail(l.emailAddress, "email");
    } catch (e) {
      errors.push(e);
      l.emailAddress = user.emailAddress;
    }

    if (errors.length > 0) {
      l.alerts = errors;
      return res.status(400).render("myProfile", l);
    }

    // update user info
    let updates = {
      firstName: l.firstName,
      lastName: l.lastName,
      userName: l.userName,
      email: l.emailAddress,
    };
    if (updates.userName === user.userName) delete updates.userName;
    if (updates.email === user.email) delete updates.email;
    try {
      await userData.updateUserProperties(_id, updates);
      l.alerts = ["User info set successfully."];
    } catch (e) {
      errors.push(e);
      l.alerts = errors;
      return res.status(400).render("myProfile", l);
    }
    return res.render("myProfile", l);
  }

  // PROFILE PICTURE FORM
  if (formType === "profilePicture") {
    // to do
  }
  return res.redirect("/");
});

export default router;
