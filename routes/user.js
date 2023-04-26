import { Router } from "express";
const router = Router();
import { userData } from "../data/index.js";

router.route("/").get(async (req, res) => {
  return res.json({ error: "No user id provided" });
});

router.route("/:id").get(async (req, res) => {
  try {
    let id = req.params.id;
    if (!id) throw "Error: You must procvide a user ID";
    if (typeof id !== "string") throw "Error: User ID must be a string";
    id = id.trim();
    if (id.length === 0)
      throw "Error: User ID cannot be an empty string or just spaces";
    if (!ObjectId.isvalid(id)) throw "Error: User ID is an invalid object ID";
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  try {
    let user = await userData.get(id);
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: "User not found" });
  }
});

export default router;
