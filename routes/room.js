import { Router } from "express";
const router = Router();

router.route("/:roomId").get(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.redirect("/")
});

export default router;
