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
  console.log(formType);
  let _id = req.session.user._id;
  let user = await userData.get(_id);
  let l = {
    profilePicture: user.profilePicture,
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
    emailAddress: user.email,
  };


  if (formType === 'password') {
    let password = req.body.passwordInput;
    let confirmPassword = req.body.confirmPasswordInput;
    console.log(password);
    console.log(confirmPassword);
    try {
      password = validator.checkPassword(password, "password");
      confirmPassword = validator.checkPassword(confirmPassword, "confirm password");
    } catch(e) {
      console.log(e);
      return res.status(400).render('myProfile', {
        profilePicture: user.profilePicture,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        emailAddress: user.email,
        error: e });
    }
    
    try {
      if (password !== confirmPassword) throw 'Password and confirm password must match';
      console.log(password);
      let updatedUser = await userData.updateUserProperties(_id, { password: password });
      res.render('myProfile', {
        title: 'My Profile', 
        message: 'Password has been updated'});
    } catch(e) {
      console.log(e);
      console.log(l);
      return res.status(400).render('myProfile', {
        profilePicture: user.profilePicture,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        emailAddress: user.email,
        error: e });
    }
  }

  else if (formType === 'userInfo') {
    let firstName = req.body.firstNameInput;
    let lastName = req.body.lastNameInput;
    let username = req.body.userNameInput;
    let email = req.body.emailAddressInput;

    try {
      firstName = validator.checkName(firstName, "first name");
      lastName = validator.checkName(lastName, "last name");
      username = validator.checkUserName(username, "username");
      email = validator.checkEmail(email, "email");
    } catch (e) {
      return res.status(400).render('myProfile', {
        profilePicture: user.profilePicture,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        emailAddress: user.email,
        error: e });
    }

    try {
      let updatedUser = await userData.updateUserProperties(_id, { firstName: firstName });
      updatedUser = await userData.updateUserProperties(_id, { lastName: lastName });
      updatedUser = await userData.updateUserProperties(_id, { userName: username });
      updatedUser = await userData.updateUserProperties(_id, { email: email });
    } catch(e) {
      res.status(400).render('myProfile', {
        profilePicture: user.profliePicture, 
        firstName: firstName, 
        lastName: lastName, 
        userName: username, 
        email: email, 
        error: e});
    }
  }

  else if (formType === 'profilePicture') {
    // to do
  }
});


export default router;
