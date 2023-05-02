import { Router } from "express";
const router = Router();

router.route("/building/:buildingId").get(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.json({error: "not implemented"})
});

router.route("/building/:buildingId").post(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.json({error: "not implemented"})
});

router.route("/room/:roomId").get(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.json({error: "not implemented"})
});

router.route("/room/:roomId").post(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.json({error: "not implemented"})
});

router.route("/container/:containerId").get(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.json({error: "not implemented"})
});

router.route("/container/:containerId").post(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.json({error: "not implemented"})
});

router.route("/item/:itemId").get(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.json({error: "not implemented"})
});

router.route("/item/:itemId").post(async (req, res) => {
  // TODO: IMPLEMENT ME
  return res.json({error: "not implemented"})
});

export default router;
