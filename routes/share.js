import { Router } from "express";
import validator from "../validator.js";
import { userData } from "../data/index.js";
const router = Router();

router.route("/:buildingId").get(async (req, res) => {
  return res.json({error: "not implemented"});
});

router.route("/:buildingId").post(async (req, res) => {
    return res.json({error: "not implemented"});
  });