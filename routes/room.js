import { Router } from "express";
const router = Router();

router.route("/").get(async (req, res) => {
  return res.json({ error: "No room id provided" });
});

router.route("/:roomId").get(async (req, res) => {
    //todo
})

export default router;
