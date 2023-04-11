import { Router } from "express";
const router = Router();

router.route("/").get(async (req, res) => {
  return res.json({ error: "No building id provided" });
});

export default router;
