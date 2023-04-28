import { Router } from "express";
import {
  userData,
  buildingData,
  roomData,
  containerData,
  itemData,
} from "../data/index.js";
import validator from "../validator.js";
const router = Router();

router.route("/mydata").get(async (req, res) => {
  let uid = req.session.user._id;
  let myData = await userData.createExport(uid);

  return res.json(myData);
});

export default router;
