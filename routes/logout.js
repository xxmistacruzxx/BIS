import { Router } from "express";
import validator from "../validator.js";
const router = Router();

router.get("/", async (req, res) => {
  try {
    validator.checkId(req.session.user._id);
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  delete req.session.user;
  return res.redirect("/login");
});

export default router;
