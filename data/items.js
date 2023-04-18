/* ITEMS DOC
_id : string -- unique
name : string
description : string
creationDate : string, date format -- default is current date
count : int
countHistory : [{"time" : string, "count" : int}, ...]
value : float
valueHistory : [{"time" : string, "value" : float}, ...]
*/
import { ObjectId } from "mongodb";
import { items, rooms, containers } from "../config/mongoCollections.js";
import {
  getDocById,
  getAllDocs,
  generateCreationDate,
} from "./databaseHelpers.js";
import { roomData, containerData } from "./index.js";
import validator from "../validator.js";

const itemProperties = ["name", "description"];

/**
 * Creates an item doc in items collection and adds it to the list of items for a container or room.
 * @param {string} id - id of the room or container to add new item to
 * @param {string} type - collection to add to (room or container) 
 * @param {string} name - name of new item
 * @param {string} description - description of new item
 * @param {int} count - count of new item
 * @param {number} value - value of new item
 * @returns object with keys and values of the newly added item
 */
async function create(id, type, name, description, count, value) {
  // basic error check
  id = validator.checkId(id, "id");
  type = validator.checkString(type, "type");
  if (type !== "room" && type !== "container")
    throw `type must be room or container`;
  name = validator.checkString(name, "name");
  description = validator.checkString(description, "description");
  count = validator.checkInt(count, "count");
  if (count < 0) throw `count must be 0 or greater`;
  value = validator.checkNum(value, "value");
  if (value < 0) throw `value must be 0 or greater`;

  // create item object
  let newItem = {
    name: name,
    description: description,
    creationDate: generateCreationDate(),
    count: count,
    countHistory: [{ time: Date.now(), count: count }],
    value: value,
    valueHistory: [{ time: Date.now(), value: value }],
  };

  // determine whether item is being put in contianer or a room, and assign according variables
  let collectionGetter;
  let dataFunctions;
  if (type === "room") {
    collectionGetter = rooms;
    dataFunctions = roomData;
  } else {
    collectionGetter = containers;
    dataFunctions = containerData;
  }

  // TODO: ensure item doesn't have same name as another item in container/room

  // add item to items collection
  await dataFunctions.get(id);
  let itemsCollection = await items();
  let insertInfo = await itemsCollection.insertOne(newItem);
  if (!insertInfo["acknowledged"] || !insertInfo["insertedId"])
    throw `could not add item`;

  // add item to room/container
  let newId = insertInfo[["insertedId"]].toString();
  if (type === "room") dataFunctions.addContainerOrItem(id, newId, "item");
  else dataFunctions.addItem(id, newId);

  let item = await get(newId);
  return item;
}

/**
 * gets an item by its id from items collection
 * @param {string} itemId - id of item to fetch from items collection
 * @returns object with keys and values of item fetched from items collection
 */
async function get(itemId) {
  return await getDocById(items, itemId, "item");
}

/**
 * gets all items from items collection
 * @returns an array of objects with keys and values of docs from items collection
 */
async function getAll() {
  return await getAllDocs(items);
}

/**
 * removes an item by id from items collection and the list where its stored (either a container or room)
 * @param {string} itemId - id of item to remove
 * @returns a string saying the item has been deleted.
 */
async function remove(itemId) {
  // basic error check
  itemId = validator.checkId(itemId, "itemId");

  // check if item with that id exists
  let item = await get(itemId);

  // determine whether item is stored in container or room
  let type;
  let collection = await containers();
  let filter = {};
  filter["items"] = { $in: [itemId] };
  let vessel = collection.findOne(filter);
  if (vessel === null) {
    collection = await rooms();
    vessel = collection.findOne(filter);
    if (vessel === null)
      throw `could not find item id ${itemId} in a container or room`;
    type = "room";
  } else type = "container";

  // remove item from said container or room
  let updateInner = {};
  updateInner["items"] = itemId;
  await collection.updateMany(filter, { $pull: updateInner });

  // remove item from items collection
  collection = await items();
  let deletionInfo = await collection.findOneAndDelete({
    _id: new ObjectId(itemId),
  });

  if (deletionInfo.lastErrorObject.n === 0) {
    throw `could not delete item with id of ${id}`;
  }

  return `${deletionInfo.value.name} has been successfully deleted!`;
}

/**
 * updates an item's properties. 
 * @param {string} itemId - id of item to update
 * @param {object} propertiesAndValues - an object with keys of properties and values to update to
 * @returns an object with they keys and values of then newly updated item 
 */
async function updateItemProperties(itemId, propertiesAndValues) {
  // basic error check
  itemId = validator.checkId(itemId, "itemId");

  let keys = Object.keys(propertiesAndValues);
  for (let i = 0; i < keys.length; i++) {
    if (!itemProperties.includes(keys[i]))
      throw `${keys[i]} is not a itemProperty. Possible properties are: ${itemProperties}`;
    propertiesAndValues[i] = validator.checkString(
      propertiesAndValues[keys[i]],
      keys[i]
    );
  }

  // update container
  let itemsCollection = await items();
  let item = await get(itemId);
  delete item._id;
  for (let i = 0; i < keys.length; i++) {
    item[keys[i]] = propertiesAndValues[keys[i]];
  }

  let updatedInfo = await itemsCollection.findOneAndUpdate(
    { _id: new ObjectId(itemId) },
    { $set: item },
    { returnDocument: "after" }
  );
  if (updatedInfo.lastErrorObject.n === 0) {
    throw "could not update item successfully";
  }
  updatedInfo.value._id = updatedInfo.value._id.toString();
  return updatedInfo.value;
}

/**
 * sets an item's count and adds it to its count history
 * @param {string} itemId - id of item to set count
 * @param {int} count - new count of item
 * @returns an object with they keys and values of the item with the updated count
 */
async function setCount(itemId, count) {
  // basic error check
  itemId = validator.checkId(itemId, "itemId");
  count = validator.checkInt(count, "count");

  // get item / check if it exists
  let item = await get(itemId);

  // TODO (maybe): check if count is the same

  // create object with updated history and count value
  let countHistory = item["countHistory"];
  let history = { time: Date.now(), count: count };
  countHistory.unshift(history);
  item["count"] = count;
  item["countHistory"] = countHistory;
  delete item._id;

  // update item in items collection
  let itemsCollection = await items();
  let updatedInfo = await itemsCollection.findOneAndUpdate(
    { _id: new ObjectId(itemId) },
    { $set: item },
    { returnDocument: "after" }
  );
  if (updatedInfo.lastErrorObject.n === 0) {
    throw "could not update item successfully";
  }
  updatedInfo.value._id = updatedInfo.value._id.toString();
  return updatedInfo.value;
}

/**
 * sets an item's value and adds it to its value history
 * @param {string} itemId - id of item to set value
 * @param {number} value - new value of item
 * @returns an object with the keys and values of the item with the updated value
 */
async function setValue(itemId, value) {
  // basic error check
  itemId = validator.checkId(itemId, "itemId");
  value = validator.checkNum(value, "value");

  // get item / check if it exists
  let item = await get(itemId);

  // TODO (maybe): check if value is the same

  let valueHistory = item["valueHistory"];
  let history = { time: Date.now(), value: value };
  valueHistory.unshift(history);
  item["value"] = value;
  item["valueHistory"] = valueHistory;
  delete item._id;

  let itemsCollection = await items();
  let updatedInfo = await itemsCollection.findOneAndUpdate(
    { _id: new ObjectId(itemId) },
    { $set: item },
    { returnDocument: "after" }
  );
  if (updatedInfo.lastErrorObject.n === 0) {
    throw "could not update item successfully";
  }
  updatedInfo.value._id = updatedInfo.value._id.toString();
  return updatedInfo.value;
}

export default {
  create,
  get,
  getAll,
  remove,
  updateItemProperties,
  setCount,
  setValue,
};
