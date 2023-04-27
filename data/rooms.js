/* ROOMS DOC
_id : ObjectId -- Unique
name : string
description : string
creationDate: string, date format -- default is current date
containers : [string, ...] -- default is empty, arr can be empty
items : [string, ...] -- default is empty, arr can be empty
*/

import { ObjectId } from "mongodb";
import { rooms, buildings } from "../config/mongoCollections.js";
import {
  getDocById,
  getAllDocs,
  generateCreationDate,
  createDoc,
  deleteDocById,
  replaceDocById,
} from "./databaseHelpers.js";
import buildingDataFunctions from "./buildings.js";
import { containerData, itemData } from "./index.js";
import validator from "../validator.js";
const roomProperties = ["name", "description"];

/**
 * Creates a room doc in rooms collection and adds it to the list of rooms for a building.
 * @param {string} buildingId - id of the building to add room to
 * @param {string} name - name of new room
 * @param {string} description - description of new room
 * @returns object with keys & values of the newly added room
 */
async function create(buildingId, name, description) {
  // basic error check
  buildingId = validator.checkId(buildingId, "buildingId");
  name = validator.checkString(name, "name");
  description = validator.checkString(description, "description");

  // add room to rooms collection
  let newRoom = {
    name: name,
    description: description,
    creationDate: generateCreationDate(),
    containers: [],
    items: [],
  };

  // TODO: ensure according building does not have a room with the same name
  await buildingDataFunctions.get(buildingId);
  newRoom = await createDoc(rooms, newRoom, "room");

  // add room to building's list of rooms
  let newId = newRoom._id;
  await buildingDataFunctions.addRoom(buildingId, newId);

  let room = await get(newId);
  return room;
}

/**
 * gets a room by its id from rooms collection
 * @param {string} roomId - id of room to fetch from rooms collection
 * @returns object with keys and values of room fetched from rooms collection
 */
export async function get(roomId) {
  return await getDocById(rooms, roomId, "room");
}

/**
 * gets all rooms from rooms collection
 * @returns an array of all room docs from rooms collection
 */
export async function getAll() {
  return await getAllDocs(rooms);
}

/**
 * removes a room by id from rooms collection and from the building its stored in. Also removes all items and containers storied in it.
 * @param {string} roomId - id of room to remove from rooms collection
 * @returns a string saying the room has been deleted
 */
export async function remove(roomId) {
  // basic error check
  roomId = validator.checkId(roomId, "roomId");

  // get room / check if it exists
  let room = await get(roomId);

  // remove room from any buildings rooms
  let buildingCollection = await buildings();
  let filter = {};
  filter["rooms"] = { $in: [roomId] };
  let updateInner = {};
  updateInner["rooms"] = roomId;
  await buildingCollection.updateMany(filter, { $pull: updateInner });

  // remove containers stored in room
  let containersToRemove = room["containers"];
  for (let i = 0; i < containersToRemove.length; i++) {
    await containerData.remove(containersToRemove[i]);
  }

  // remove items stored in room
  let itemsToRemove = room["items"];
  for (let i = 0; i < itemsToRemove.length; i++) {
    await itemData.remove(itemsToRemove[i]);
  }

  // remove room from collection
  room = await deleteDocById(rooms, roomId, "room");

  return room;
}

/**
 * updates a room doc's properties by its id.
 * @param {string} roomId - the id of the room to update
 * @param {object} propertiesAndValues - an object with keys being elems of @const roomProperties and of proper values
 * @returns an object with keys & new values the updated room in rooms collection
 */
export async function updateRoomProperty(roomId, propertiesAndValues) {
  // basic error check
  roomId = validator.checkId(roomId, "roomId");
  if (!validator.isObject(propertiesAndValues))
    throw `propertiesAndValues must be an object`;

  let keys = Object.keys(propertiesAndValues);
  for (let i = 0; i < keys.length; i++) {
    if (!roomProperties.includes(keys[i]))
      throw `${keys[i]} is not a roomProperty. Possible properties are: ${roomProperties}`;
    propertiesAndValues[i] = validator.checkString(
      propertiesAndValues[keys[i]],
      keys[i]
    );
  }

  // update building
  let room = await get(roomId);
  delete room._id;
  for (let i = 0; i < keys.length; i++) {
    room[keys[i]] = propertiesAndValues[keys[i]];
  }

  room = await replaceDocById(rooms, roomId, room, "room");
  return room;
}

/**
 * Adds container or item to list of room's containers or items.
 * @param {string} roomId - id of room to add item or container
 * @param {string} id - id of container or item
 * @param {string} type - type to add to ('container' or 'item')
 * @returns an object with keys and values of the room with newly added container/item
 */
export async function addContainerOrItem(roomId, id, type) {
  // basic error check
  roomId = validator.checkId(roomId, "roomId");
  id = validator.checkId(id, "id");
  type = validator.checkString(type, "type");
  if (type !== "item" && type !== "container")
    throw `type must be a an item or container`;

  // get room / check for existance
  let room = await get(roomId);

  // check for item/container's existance
  if (type === "item") await itemData.get(id);
  else await containerData.get(id);

  // append new container or item to room
  delete room._id;
  type = `${type}s`;
  let t = room[type];
  t.push(id);
  room[type] = t;

  // update room doc
  room = await replaceDocById(rooms, roomId, room, "room");
  return room;
}

export async function removeContainerOrItem(roomId, id, type) {
  // basic error check
  roomId = validator.checkId(roomId, "roomId");
  id = validator.checkId(id, "id");
  type = validator.checkString(type, "type");

  // update building with removed room
  let roomsCollection = await rooms();
  let room = await get(roomId);
  delete room._id;
  type = `${type}s`;
  let t = room[type];
  let index = t.indexOf(id);
  if (index === -1) throw `${type} ${id} is not in room ${roomId}'s ${type}`;
  t.splice(index, 1);
  room[type] = t;

  room = replaceDocById(rooms, roomId, room, "room");

  // TODO: Remove according container or item from their collection

  return room;
}

export default {
  create,
  get,
  getAll,
  remove,
  updateRoomProperty,
  addContainerOrItem,
  // removeContainerOrItem,
};
