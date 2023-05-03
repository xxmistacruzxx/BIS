import { Router } from "express";
const router = Router();

router.route("/:containerId").get(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.redirect("/")
});

export default router;
