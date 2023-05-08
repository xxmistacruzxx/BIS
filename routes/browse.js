import { Router } from "express";
import validator from "../validator.js";
import { userData } from "../data/index.js";
import { buildingData } from "../data/index.js";
import xss from "xss"
const router = Router();

router.route("/").get(async (req, res) => {
  let buildings;
  let skip = 0;
  try {
    buildings = await buildingData.getPublicBuildings(skip);
  } catch (e) {
    return res.status(500).render("error", { code: 500, error: e });
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
    skip = validator.checkInt(Number(xss(skip)), "skip");
    if (skip < 0) return res.redirect("/browse");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  try {
    buildings = await buildingData.getPublicBuildings(skip);
  } catch (e) {
    return res.status(500).render("error", { code: 500, error: e });
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
  let nextBuildings;
  try {
    nextBuildings = await buildingData.getPublicBuildings(skip + 20);
  } catch (e) {
    return res.status(500).render("error", { code: 500, error: e });
  }

  if (nextBuildings.length === 0) next = skip;

  let l = {
    buildings: buildings,
    prev: prev.toString(),
    next: next.toString(),
  };
  return res.render("browse", l);
});

export default router;
