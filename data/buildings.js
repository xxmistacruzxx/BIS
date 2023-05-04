/* BUILDINGS DOC
_id : ObjectId -- Unique
name : string
description : string
creationDate : string, date format -- default is current date
address : string
city : string
state : string
zip : string
publicBuilding : boolean
rooms : ["string", ...] -- default is empty, arr can be empty
*/

import { ObjectId } from "mongodb";
import { users, buildings } from "../config/mongoCollections.js";
import {
  getDocById,
  getAllDocs,
  generateCreationDate,
  createDoc,
  deleteDocById,
  replaceDocById,
  getAllDocsByParam,
} from "./databaseHelpers.js";
import userDataFunctions from "./users.js";
import validator from "../validator.js";
import { roomData } from "./index.js";
const buildingProperties = [
  "name",
  "description",
  "address",
  "city",
  "state",
  "zip",
  "publicBuilding",
];

/**
 * Creates new building doc in buildings collection. Also adds building to a user's list of owned buildings.
 * @param {string} userId - the userId of the user who created the building
 * @param {string} name - the name of the building
 * @param {string} description - a description of the building
 * @param {string} address - street address of building
 * @param {string} city - city of building
 * @param {string} state - state of building
 * @param {string} zip - area code of building
 * @param {boolean} publicBuilding - whether the building can be viewed by all users
 * @returns object with keys & values of the newly added building
 */
export async function create(
  userId,
  name,
  description,
  address,
  city,
  state,
  zip,
  publicBuilding
) {
  // basic error check
  userId = validator.checkId(userId, "userId");
  name = validator.checkString(name, "name");
  description = validator.checkString(description, "description");
  address = validator.checkString(address, "address");
  city = validator.checkString(city, "city");
  state = validator.checkString(state, "state");
  try {
    zip = validator.checkString(zip, "zip");
  } catch (e) {
    if (
      e ===
      `${zip.trim()} is not a valid value for zip as it only contains digits`
    )
      zip = zip.trim();
    else throw e;
  }
  // TODO: check if state and zips are valid
  if (publicBuilding === undefined) throw `publicBuilding must be provided`;
  if (typeof publicBuilding !== "boolean")
    throw `publicBuilding must be a boolean`;
  let user = await userDataFunctions.get(userId);

  // add building to collection
  let newBuilding = {
    name: name,
    description: description,
    creationDate: generateCreationDate(),
    address: address,
    city: city,
    state: state,
    zip: zip,
    publicBuilding: publicBuilding,
    rooms: [],
  };

  // TODO: ensure duplicate buildings can't be made

  newBuilding = await createDoc(buildings, newBuilding, "building");

  // add ownership relation to user
  let newId = newBuilding._id;
  await userDataFunctions.addBuildingRelation(
    user._id,
    "buildingOwnership",
    newId
  );

  let building = await get(newId);
  return building;
}

/**
 * gets all building docs in buildings collection
 * @returns an array of all building docs from buildings collection
 */
export async function getAll() {
  return await getAllDocs(buildings);
}

/**
 * gets a building doc by its id from building's collection
 * @param {string} id - id of the building to fetch from buildings collection
 * @returns an object with keys & values the building fetched from buildings collection
 */
export async function get(id) {
  return await getDocById(buildings, id, "building");
}

export async function getPublicBuildings() {
  return await getAllDocsByParam(buildings, "publicBuilding", true, "building");
}

/**
 * removes a building doc by its id from buildings collection and removes relations from all other users. Also removes any rooms inside it.
 * @param {string} id - id of building to remove from buildings collection
 * @returns building doc that was removed
 */
export async function remove(id) {
  // basic error checks
  id = validator.checkId(id, "id");

  // get building / check for existance
  let building = await get(id);

  // remove building from any user relations
  let relations = userDataFunctions.userBuildingRelations;
  let usersCollection = await users();
  for (let i = 0; i < relations.length; i++) {
    let filter = {};
    filter[relations[i]] = { $in: [id] };
    let updateInner = {};
    updateInner[relations[i]] = id;
    await usersCollection.updateMany(filter, { $pull: updateInner });
  }

  // remove rooms in the building from rooms collection
  for (let i = 0; i < building["rooms"].length; i++) {
    await roomData.remove(building["rooms"][i]);
  }

  // remove building from buildings collection
  building = deleteDocById(buildings, id, "building");

  return building;
}

/**
 * @param {string} buildingId - the building id of the building to update
 * @param {object} propertiesAndValues - an object with keys being elems of @const buildingProperties and of proper values
 * @returns an object with keys & new values the updated building from buildings collection
 */
export async function updateBuildingProperties(
  buildingId,
  propertiesAndValues
) {
  // basic error check
  buildingId = validator.checkId(buildingId, "buildingId");
  if (!validator.isObject(propertiesAndValues))
    throw `propertiesAndValues must be an object`;

  let keys = Object.keys(propertiesAndValues);
  for (let i = 0; i < keys.length; i++) {
    if (!buildingProperties.includes(keys[i]))
      throw `${keys[i]} is not a buildingProperty. Possible properties are: ${buildingProperties}`;
    if (keys[i] === "publicBuilding") {
      if (typeof propertiesAndValues[keys[i]] !== "boolean")
        throw `publicBuilding in propertiesAndValues must be a boolean`;
    } else {
      if (keys[i] === "zip") {
        propertiesAndValues[keys[i]] = propertiesAndValues[keys[i]].trim();
      } else {
        propertiesAndValues[keys[i]] = validator.checkString(
          propertiesAndValues[keys[i]],
          keys[i]
        );
      }
    }
  }

  // update building
  let buildingsCollection = await buildings();
  let building = await get(buildingId);
  delete building._id;
  for (let i = 0; i < keys.length; i++) {
    building[keys[i]] = propertiesAndValues[keys[i]];
  }

  building = await replaceDocById(buildings, buildingId, building, "building");
  return building;
}

/**
 * adds roomId to a building's list of rooms
 * @param {string} buildingId - id of building to add room to
 * @param {string} roomId - id of room to add
 * @returns an object with the keys and values of the building with the newly added room
 */
export async function addRoom(buildingId, roomId) {
  // basic error check
  buildingId = validator.checkId(buildingId, "buildingId");
  roomId = validator.checkId(roomId, "roomId");

  // update building with added room
  let building = await get(buildingId);
  // check room for existance
  await roomData.get(roomId);

  // append room
  delete building._id;
  let t = building["rooms"];
  t.push(roomId);
  building["rooms"] = t;

  building = replaceDocById(buildings, buildingId, building, "building");
  return building;
}

/**
 * DEPRECATED
 */
export async function removeRoom(buildingId, roomId) {
  // basic error check
  buildingId = validator.checkId(buildingId, "buildingId");
  roomId = validator.checkId(roomId, "roomId");

  // get building / check for existance
  let building = await get(buildingId);

  // update building with removed room
  delete building._id;
  let t = building["rooms"];
  let index = t.indexOf(roomId);
  if (index === -1)
    throw `room ${roomId} is not in building ${buildingId}'s rooms`;
  t.splice(index, 1);
  building["rooms"] = t;

  building = replaceDocById(buildings, buildingId, building, "building");

  // Remove room from rooms collection
  roomData.remove(roomId);

  return building;
}

/**
 * creates an object representation of data related to a building.
 * @param {string} buildingId - the id of a container to export
 * @returns {object} with keys & values of a building where the nested rooms, containers, and items have been changed from ids to the actual objects.
 */
export async function createExport(buildingId) {
  // basic error check
  buildingId = validator.checkId(buildingId, "buildingId");
  let building = await get(buildingId);

  // TODO: recursively call rooms
  let roomsLength = building.rooms.length;
  for (let i = 0; i < roomsLength; i++) {
    building.rooms[i] = await roomData.createExport(building.rooms[i]);
  }

  return building;
}

export async function createSubEntriesHtmlRender(buildingId) {
  // basic error checks
  buildingId = validator.checkId(buildingId, "buildingId");

  let thisBuildingData = await createExport(buildingId);
  let sER = "<ul>";
  for (let room of thisBuildingData.rooms) {
    sER =
      sER +
      `<li><a href="/room/${room._id}">${room.name} - ${room.description}</a>`;
    sER = sER + `<p>${room.name} Containers</p><ul>`;
    for (let container of room.containers) {
      sER =
        sER +
        `<li><a href="/container/${container._id}">${container.name} - ${container.description}</a>`;
      sER = sER + `<p>${container.name} Items</p><ul>`;
      for (let item of container.items) {
        sER =
          sER +
          `<li><a href="/item/${item._id}">${item.name} - ${item.description} | Count: ${item.count} | Value: ${item.value}</a></li>`;
      }
      sER = sER + `</ul></li>`;
    }
    sER = sER + `</ul><p>${room.name} Items</p><ul>`;
    for (let item of room.items) {
      sER =
        sER +
        `<li><a href="/item/${item._id}">${item.name} - ${item.description} | Count: ${item.count} | Value: ${item.value}</a></li>`;
    }
    sER = sER + `</ul></li>`;
  }
  sER = sER + "</ul>";
  return sER;
}

export async function createSubEntriesHtmlRenderEdit(buildingId) {
  // basic error checks
  buildingId = validator.checkId(buildingId, "buildingId");

  let thisBuildingData = await createExport(buildingId);
  let sER = "<ul>";
  for (let room of thisBuildingData.rooms) {
    sER =
      sER +
      `<li><div class="linkDiv><a href="/room/${room._id}">${room.name} - ${room.description}</a> | <a href="/edit/room/${room._id}">Edit</a> | <a href="/delete/room/${room._id}">Delete</a></div>`;
    sER = sER + `<p>${room.name} Containers</p><ul>`;
    for (let container of room.containers) {
      sER =
        sER +
        `<li><div class="linkDiv><a href="/container/${container._id}">${container.name} - ${container.description}</a> | <a href="/edit/container/${container._id}">Edit</a> | <a href="/delete/container/${container._id}">Delete</a></div>`;
      sER = sER + `<p>${container.name} Items</p><ul>`;
      for (let item of container.items) {
        sER =
          sER +
          `<li><div class="linkDiv><a href="/item/${item._id}">${item.name} - ${item.description} | Count: ${item.count} | Value: ${item.value}</a> | <a href="/edit/item/${item._id}">Edit</a> | <a href="/delete/item/${item._id}">Delete</a></div></li>`;
      }
      sER = sER + `</ul></li>`;
    }
    sER = sER + `</ul><p>${room.name} Items</p><ul>`;
    for (let item of room.items) {
      sER =
        sER +
        `<li><div class="linkDiv><a href="/item/${item._id}">${item.name} - ${item.description} | Count: ${item.count} | Value: ${item.value}</a> | <a href="/edit/item/${item._id}">Edit</a> | <a href="/delete/item/${item._id}">Delete</a></div></li>`;
    }
    sER = sER + `</ul></li>`;
  }
  sER = sER + "</ul>";
  return sER;
}

export async function isPublic(buildingId) {
  // basic error check
  buildingId = validator.checkId(buildingId, "roomId");
  let building = await get(buildingId);

  return building.publicBuilding;
}

export async function manageList(buildingId) {
  // basic error check
  buildingId = validator.checkId(buildingId, "buildingId");
  let building = await get(buildingId);

  let collection = await users();
  let filter = {};
  filter["buildingManageAccess"] = { $in: [buildingId] };
  let userList = await collection.find(filter).toArray();
  console.log(userList);

  return userList;
}

export async function viewList(buildingId) {
  // basic error check
  buildingId = validator.checkId(buildingId, "buildingId");
  let building = await get(buildingId);

  let collection = await users();
  let filter = {};
  filter["buildingViewAccess"] = { $in: [buildingId] };
  let userList = await collection.find(filter).toArray();
  console.log(userList);

  return userList;
}

export default {
  create,
  getAll,
  get,
  getPublicBuildings,
  remove,
  updateBuildingProperties,
  addRoom,
  // removeRoom,
  createExport,
  createSubEntriesHtmlRender,
  createSubEntriesHtmlRenderEdit,
  isPublic,
  manageList,
  viewList,
};
