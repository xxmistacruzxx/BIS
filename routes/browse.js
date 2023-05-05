import { Router } from "express";
import validator from "../validator.js";
import { userData } from "../data/index.js";
import { buildingData } from "../data/index.js";
const router = Router();

router.route("/").get(async (req, res) => {
  let buildings;
  let skip = 0;
  try {
    buildings = await buildingData.getPublicBuildings(skip);
  } catch (e) {
    return res.status(500).json({ error: e });
  }

  for (let i = 0; i < buildings.length; i++) {
    buildings[
      i
    ] = `<li><a href="/building/${buildings[i]._id}">${buildings[i].name} | ${buildings[i].description}</a></li>`;
  }

  let l = {
    buildings: buildings,
    prev: "0",
    next: "20",
  };
  return res.render("browse", l);
});

router.route("/:skip").get(async (req, res) => {
  let buildings;
  let skip = req.params.skip;
  try {
    skip = validator.checkInt(Number(skip), "skip");
    if (skip < 0) return res.redirect("/browse");
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  try {
    buildings = await buildingData.getPublicBuildings(skip);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
  if (buildings.length === 0) return res.redirect("/browse");

  for (let i = 0; i < buildings.length; i++) {
    buildings[
      i
    ] = `<li><a href="/building/${buildings[i]._id}">${buildings[i].name} | ${buildings[i].description}</a></li>`;
  }
  let prev = 0;
  if (skip >= 20) prev = skip - 20;
  let next = skip + 20;
  let nextBuildings = await buildingData.getPublicBuildings(skip + 20)
  if (nextBuildings.length === 0)
    next = skip;

  let l = {
    buildings: buildings,
    prev: prev.toString(),
    next: next.toString(),
  };
  return res.render("browse", l);
});

export default router;
