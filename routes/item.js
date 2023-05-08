import { Router } from "express";
import { itemData, userData } from "../data/index.js";
import validator from "../validator.js";
import xss from "xss"
const router = Router();
import middleware from "../middleware.js";
import { itemImages } from "../config/mongoCollections.js";

router.route("/:itemId").get(async (req, res) => {
  // basic error checks
  let userId = req.session.user._id;
  try {
    userId = validator.checkId(userId, "userId");
    await userData.get(userId);
  } catch (e) {
    return res.status(401).render("error", { code: 401, error: e });
  }
  let itemId;
  try {
    itemId = xss(req.params.itemId);
    itemId = validator.checkId(itemId, "itemId");
  } catch (e) {
    return res.status(400).render("error", { code: 400, error: e });
  }
  let item;
  try {
    item = await itemData.get(itemId);
  } catch (e) {
    return res.status(404).render("error", { code: 404, error: e });
  }

  // check if user exists and if they have access to item (is owner, manager, viewer, or building is public)
  if (
    !(await userData.hasViewerAccess(userId, "item", itemId)) &&
    !(await itemData.isPublic(itemId))
  )
    return res
      .status(403)
      .render("error", { code: 403, error: "you cannot access this item" });

  let canEdit = false;
  let canDelete = false;
  if (await userData.hasOwnerAccess(userId, "item", itemId)) {
    canEdit = true;
    canDelete = true;
  } else if (await userData.hasEditAccess(userId, "item", itemId)) {
    canEdit = true;
  }

  // get item stats
  let countStats = {
    average: 0,
    low: item.count,
    high: item.count,
  };
  for (let i = 0; i < item.countHistory.length; i++) {
    if (item.countHistory[i].count < countStats.low)
      countStats.low = item.countHistory[i].count;
    if (item.countHistory[i].count > countStats.high)
      countStats.high = item.countHistory[i].count;
    countStats.average = countStats.average + item.countHistory[i].count;
  }
  countStats.average =
    Math.round((countStats.average / item.countHistory.length) * 100) / 100;

  let valueStats = {
    average: 0,
    low: item.value,
    high: item.value,
  };
  for (let i = 0; i < item.valueHistory.length; i++) {
    if (item.valueHistory[i].value < valueStats.low)
      valueStats.low = item.valueHistory[i].value;
    if (item.valueHistory[i].value > valueStats.high)
      valueStats.high = item.valueHistory[i].value;
    valueStats.average = valueStats.average + item.valueHistory[i].value;
  }
  valueStats.average =
    Math.round((valueStats.average / item.valueHistory.length) * 100) / 100;

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
    change = Math.round(change * 100) / 100;
    if (change > 0) change = "+" + change;
    item.valueHistory[i] = `Time: ${new Date(
      item.valueHistory[i].time
    ).toString()} | Value: ${item.valueHistory[i].value} | Change: ${change}`;
  }
  last = item.valueHistory[item.valueHistory.length - 1];
  item.valueHistory[item.valueHistory.length - 1] = `Time: ${new Date(
    last.time
  ).toString()} | Value: ${last.value} | Change: N/A`;

  // get path of images that the item has
  let itemImagesCollection = await itemImages();
  let images = await itemImagesCollection.findOne({ itemId: item._id });
  if (images) {
    return res.render("item", {
      id: item._id,
      itemName: item.name,
      itemCreationDate: item.creationDate,
      itemDescription: item.description,
      canEdit: canEdit,
      canDelete: canDelete,
      countHistory: item.countHistory,
      valueHistory: item.valueHistory,
      avgCount: countStats.average,
      lowCount: countStats.low,
      highCount: countStats.high,
      avgValue: valueStats.average,
      lowValue: valueStats.low,
      highValue: valueStats.high,
      images: images.pathList,
    });
  } else {
    return res.render("item", {
      id: item._id,
      itemName: item.name,
      itemCreationDate: item.creationDate,
      itemDescription: item.description,
      canEdit: canEdit,
      canDelete: canDelete,
      countHistory: item.countHistory,
      valueHistory: item.valueHistory,
      avgCount: countStats.average,
      lowCount: countStats.low,
      highCount: countStats.high,
      avgValue: valueStats.average,
      lowValue: valueStats.low,
      highValue: valueStats.high,
    });
  }
});

router
  .route("/:itemId")
  .post(middleware.itemUpload.array("image", undefined), async (req, res) => {
    let itemId; 
    let userId = req.session.user._id;
    let item;
    try {
      itemId = xss(req.params.itemId);
      item = await itemData.get(itemId);
    } catch (e) {
      return res.status(404).render("error", { code: 404, error: e });
    }

    if (req.body.removeAll) {
      // check if theres an item in the collection with a matching itemId
      let itemImagesCollection = await itemImages();
      let existingItem = await itemImagesCollection.findOne({ itemId: itemId });

      // if there is, then delete it
      if (existingItem) {
        await itemImagesCollection.deleteOne({ itemId: itemId });
      }
      return res.redirect(`/item/${itemId}`);
    }

    let canEdit = false;
    let canDelete = false;
    if (await userData.hasOwnerAccess(userId, "item", itemId)) {
      canEdit = true;
      canDelete = true;
    } else if (await userData.hasEditAccess(userId, "item", itemId)) {
      canEdit = true;
    }

    if (!canEdit)
      return res.status(403).render("error", { code: 403, error: "you cannot add an image" });

    // get item stats
    let countStats = {
      average: 0,
      low: item.count,
      high: item.count,
    };
    for (let i = 0; i < item.countHistory.length; i++) {
      if (item.countHistory[i].count < countStats.low)
        countStats.low = item.countHistory[i].count;
      if (item.countHistory[i].count > countStats.high)
        countStats.high = item.countHistory[i].count;
      countStats.average = countStats.average + item.countHistory[i].count;
    }
    countStats.average =
      Math.round((countStats.average / item.countHistory.length) * 100) / 100;

    let valueStats = {
      average: 0,
      low: item.value,
      high: item.value,
    };
    for (let i = 0; i < item.valueHistory.length; i++) {
      if (item.valueHistory[i].value < valueStats.low)
        valueStats.low = item.valueHistory[i].value;
      if (item.valueHistory[i].value > valueStats.high)
        valueStats.high = item.valueHistory[i].value;
      valueStats.average = valueStats.average + item.valueHistory[i].value;
    }
    valueStats.average =
      Math.round((valueStats.average / item.valueHistory.length) * 100) / 100;

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
      change = Math.round(change * 100) / 100;
      if (change > 0) change = "+" + change;
      item.valueHistory[i] = `Time: ${new Date(
        item.valueHistory[i].time
      ).toString()} | Value: ${item.valueHistory[i].value} | Change: ${change}`;
    }
    last = item.valueHistory[item.valueHistory.length - 1];
    item.valueHistory[item.valueHistory.length - 1] = `Time: ${new Date(
      last.time
    ).toString()} | Value: ${last.value} | Change: N/A`;

    try {
      if (!req.files || Object.keys(req.files).length === 0)
        throw "Please choose files to upload.";
      const files = Object.values(req.files);
      if (files.length > 6) throw "You can upload up to 6 files.";
      for (const file of files) {
        if (file.size > 1 * 512 * 512) throw "File size limit exceeded.";
        const allowedTypes = ['image/jpeg', 'image/png', 'image/tiff'];
        if (!allowedTypes.includes(file.mimetype)) throw "Invalid file type. Only jpg, jpeg, png, and tiff files are allowed.";
      }
    } catch (e) {
      return res.status(400).render("item", {
        id: item._id,
        itemName: item.name,
        itemCreationDate: item.creationDate,
        itemDescription: item.description,
        canEdit: canEdit,
        canDelete: canDelete,
        countHistory: item.countHistory,
        valueHistory: item.valueHistory,
        avgCount: countStats.average,
        lowCount: countStats.low,
        highCount: countStats.high,
        avgValue: valueStats.average,
        lowValue: valueStats.low,
        highValue: valueStats.high,
        error: e,
      });
    }

    try {
      if (req.files) {
        const imagePathList = req.files.map(
          (file) => `../public/images/items/${file.filename}`
        );
        let itemImages = itemData.createItemImages(item._id, imagePathList);
        console.log(imagePathList);
        return res.redirect(`/item/${item._id}`);
      }
    } catch (e) {
      return res.status(400).render("item", {
        id: item._id,
        itemName: item.name,
        itemCreationDate: item.creationDate,
        itemDescription: item.description,
        canEdit: canEdit,
        canDelete: canDelete,
        countHistory: item.countHistory,
        valueHistory: item.valueHistory,
        avgCount: countStats.average,
        lowCount: countStats.low,
        highCount: countStats.high,
        avgValue: valueStats.average,
        lowValue: valueStats.low,
        highValue: valueStats.high,
        error: e,
      });
    }
  });

export default router;
