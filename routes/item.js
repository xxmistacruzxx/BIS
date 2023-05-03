import { Router } from "express";
import { itemData, userData } from "../data/index.js";
import validator from "../validator.js";
const router = Router();

router.route("/:itemId").get(async (req, res) => {
  // basic error checks
  let userId = req.session.user._id;
  try {
    userId = validator.checkId(userId, "userId");
    await userData.get(userId);
  } catch (e) {
    res.status(401).json({ error: e });
  }
  let itemId;
  try {
    itemId = req.params.itemId;
    itemId = validator.checkId(itemId, "itemId");
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  let item;
  try {
    item = await itemData.get(itemId);
  } catch (e) {
    return res.status(404).json({ error: "no item with that id" });
  }

  // check if user exists and if they have access to item (is owner, manager, viewer, or building is public)
  if (
    !await userData.hasViewerAccess(userId, "item", itemId)
    && !await itemData.isPublic(itemId)
  )
    return res
      .status(403)
      .json({ error: "you do not have access to this item" });

  console.log()

  let canEdit = false;
  let canDelete = false;
  if (await userData.hasOwnerAccess(userId, "item", itemId)) {
    canEdit = true;
    canDelete = true;
  } else if (await userData.hasEditAccess(userId, "item", itemId)) {
    canEdit = true;
  }

  // create list to insert of item count and value histories
  for (let i = 0; i < item.countHistory.length - 1; i++) {
    let change = item.countHistory[i].count - item.countHistory[i + 1].count;
    if (change > 0) change = "+" + change;
    item.countHistory[i] = `Time: ${new Date(
      item.countHistory[i].time
    ).toString()} | Count: ${item.countHistory[i].count} | Change: ${change}`;
  }
  let last = item.countHistory[item.countHistory.length - 1];
  item.countHistory[item.countHistory.length - 1] = `Time: ${new Date(
    last.time
  ).toString()} | Count: ${last.count} | Change: N/A`;

  for (let i = 0; i < item.valueHistory.length - 1; i++) {
    let change = item.valueHistory[i].value - item.valueHistory[i + 1].value;
    change = Math.round(change * 100) / 100
    if (change > 0) change = "+" + change;
    item.valueHistory[i] = `Time: ${new Date(
      item.valueHistory[i].time
    ).toString()} | Value: ${item.valueHistory[i].value} | Change: ${change}`;
  }
  last = item.valueHistory[item.valueHistory.length - 1];
  item.valueHistory[item.valueHistory.length - 1] = `Time: ${new Date(
    last.time
  ).toString()} | Value: ${last.value} | Change: N/A`;

  return res.render("item", {
    id: item._id,
    itemName: item.name,
    itemCreationDate: item.creationDate,
    itemDescription: item.description,
    canEdit: canEdit,
    canDelete: canDelete,
    countHistory: item.countHistory,
    valueHistory: item.valueHistory,
  });
});

export default router;
