/* CONTAINERS DOC
_id : ObjectID -- unique
name : string
description : string
creationDate : string, date format -- default is current date
items : [string, ...] -- default is empty, arr can be empty
*/
import { ObjectId } from "mongodb";
import { rooms, containers } from "../config/mongoCollections.js";
import {
  getDocById,
  getAllDocs,
  generateCreationDate,
} from "./databaseHelpers.js";
import { itemData, roomData } from "./index.js";
import validator from "../validator.js";

const containerProperties = ["name", "description"];

/**
 * Creates an container doc in containers collection and adds it to the list of containers for a room.
 * @param {*} roomId - id of room to store container in
 * @param {*} name - name of new container
 * @param {*} description - description of new container
 * @returns object with keys and values of newly added container
 */
async function create(roomId, name, description) {
  roomId = validator.checkId(roomId, "containerId");
  name = validator.checkString(name, "name");
  description = validator.checkString(description, "description");

  // TODO: check there are no other containers with the same name in the room
  await roomData.get(roomId);
  let newContainer = {
    name: name,
    description: description,
    creationDate: generateCreationDate(),
    items: [],
  };
  let containersCollection = await containers();
  let insertInfo = await containersCollection.insertOne(newContainer);
  if (!insertInfo["acknowledged"] || !insertInfo["insertedId"])
    throw `could not add container`;

  // add container to rooms's list of containers
  let newId = insertInfo[["insertedId"]].toString();
  await roomData.addContainerOrItem(roomId, newId, "container");

  let container = await get(newId);
  return container;
}

/**
 * gets a container by its id from containers collection
 * @param {string} containerId - id of container to fetch from containers collection
 * @returns object with keys and values of container fetched from containers collection
 */
async function get(containerId) {
  return await getDocById(containers, containerId, "container");
}

/**
 * gets all containers from containers collection
 * @returns an array of objects with keys and values of docs from containers collection
 */
async function getAll() {
  return await getAllDocs(containers);
}

/**
 * removes a container by id from containers collection and from the room its stored in. Also removes all items stored in it.
 * @param {string} containerId - id of container to remove
 * @returns a string saying the container has been deleted.
 */
async function remove(containerId) {
  // basic error check
  containerId = validator.checkId(containerId, "containerId");

  let containersCollection = await containers();
  let container = await get(containerId);

  // remove container from any room's containers
  let roomsCollection = await rooms();
  let filter = {};
  filter["containers"] = { $in: [containerId] };
  let updateInner = {};
  updateInner["containers"] = containerId;
  await roomsCollection.updateMany(filter, { $pull: updateInner });

  // remove any items that were in the container
  let itemsToDelete = container["items"];
  for (let i = 0; i < itemsToDelete.length; i++) {
    await itemData.remove(itemsToDelete[i]);
  }

  // remove container from containers collection
  let deletionInfo = await containersCollection.findOneAndDelete({
    _id: new ObjectId(containerId),
  });
  if (deletionInfo.lastErrorObject.n === 0) {
    throw `could not delete container with id of ${id}`;
  }

  return `${deletionInfo.value.name} has been successfully deleted!`;
}

/**
 * updates a container's properties.
 * @param {string} containerId - id of container to update
 * @param {object} propertiesAndValues - an object with keys of properties and values to update to
 * @returns an object with they keys and values of then newly updated container
 */
async function updateContainerProperties(containerId, propertiesAndValues) {
  // basic error check
  containerId = validator.checkId(containerId, "containerId");

  let keys = Object.keys(propertiesAndValues);
  for (let i = 0; i < keys.length; i++) {
    if (!containerProperties.includes(keys[i]))
      throw `${keys[i]} is not a containerProperty. Possible properties are: ${containerProperties}`;
    propertiesAndValues[i] = validator.checkString(
      propertiesAndValues[keys[i]],
      keys[i]
    );
  }

  // update container
  let containersCollection = await containers();
  containerId = await get(containerId);
  delete containerId._id;
  for (let i = 0; i < keys.length; i++) {
    containerId[keys[i]] = propertiesAndValues[keys[i]];
  }

  let updatedInfo = await containersCollection.findOneAndUpdate(
    { _id: new ObjectId(containerId) },
    { $set: containerId },
    { returnDocument: "after" }
  );
  if (updatedInfo.lastErrorObject.n === 0) {
    throw "could not update container successfully";
  }
  updatedInfo.value._id = updatedInfo.value._id.toString();
  return updatedInfo.value;
}

/**
 * adds an item id to a container's list of items
 * @param {string} containerId - id of container to add item to
 * @param {string} itemId - id of item to add to container
 * @returns an object with keys and values of container with added item
 */
async function addItem(containerId, itemId) {
  // basic error check
  containerId = validator.checkId(containerId, "containerId");
  itemId = validator.checkId(itemId, "itemId");

  let container = await get(containerId);
  await itemData.get(itemId);
  delete container._id;
  let t = container["items"];
  t.push(itemId);
  container["items"] = t;

  let containersCollection = await containers();
  let updatedInfo = await containersCollection.findOneAndUpdate(
    { _id: new ObjectId(containerId) },
    { $set: container },
    { returnDocument: "after" }
  );
  if (updatedInfo.lastErrorObject.n === 0) {
    throw "could not update container successfully";
  }
  updatedInfo.value._id = updatedInfo.value._id.toString();
  return updatedInfo.value;
}

async function removeItem(containerId, itemId) {
  containerId = validator.checkId(containerId, "containerId");
  itemId = validator.checkId(itemId, "itemId");

  // update building with removed room
  let containersCollection = await containers();
  let container = await get(containerId);
  delete container._id;
  let t = container["items"];
  let index = t.indexOf(itemId);
  if (index === -1)
    throw `${itemId} is not in container ${containerId}'s items`;
  t.splice(index, 1);
  container["items"] = t;

  let updatedInfo = await containersCollection.findOneAndUpdate(
    { _id: new ObjectId(containerId) },
    { $set: container },
    { returnDocument: "after" }
  );
  if (updatedInfo.lastErrorObject.n === 0) {
    throw "could not update container successfully";
  }

  // TODO: Remove item from items collection

  updatedInfo.value._id = updatedInfo.value._id.toString();
  return updatedInfo.value;
}

export default {
  create,
  get,
  getAll,
  remove,
  updateContainerProperties,
  addItem,
  // removeItem,
};
