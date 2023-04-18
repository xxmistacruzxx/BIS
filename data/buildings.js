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
async function create(
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
      `Error: ${zip.trim()} is not a valid value for zip as it only contains digits`
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

  let buildingCollection = await buildings();
  let insertInfo = await buildingCollection.insertOne(newBuilding);
  if (!insertInfo["acknowledged"] || !insertInfo["insertedId"])
    throw `could not add building`;

  // add ownership relation to user
  let newId = insertInfo[["insertedId"]].toString();
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
async function getAll() {
  return await getAllDocs(buildings);
}

/**
 * gets a building doc by its id from building's collection
 * @param {string} id - id of the building to fetch from buildings collection
 * @returns an object with keys & values the building fetched from buildings collection
 */
async function get(id) {
  return await getDocById(buildings, id, "building");
}

/**
 * removes a building doc by its id from buildings collection and removes relations from all other users. Also removes any rooms inside it.
 * @param {string} id - id of building to remove from buildings collection
 * @returns a string saying the building has been deleted
 */
async function remove(id) {
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
  let buildingsCollection = await buildings();
  let deletionInfo = await buildingsCollection.findOneAndDelete({
    _id: new ObjectId(id),
  });
  if (deletionInfo.lastErrorObject.n === 0) {
    throw `could not delete building with id of ${id}`;
  }

  return `${deletionInfo.value.name} has been successfully deleted!`;
}

/**
 * @param {string} buildingId - the building id of the building to update
 * @param {object} propertiesAndValues - an object with keys being elems of @const buildingProperties and of proper values
 * @returns an object with keys & new values the updated building from buildings collection
 */
async function updateBuildingProperties(buildingId, propertiesAndValues) {
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
      propertiesAndValues[keys[i]] = validator.checkString(
        propertiesAndValues[keys[i]],
        keys[i]
      );
    }
  }

  // update building
  let buildingsCollection = await buildings();
  let building = await get(buildingId);
  delete building._id;
  for (let i = 0; i < keys.length; i++) {
    building[keys[i]] = propertiesAndValues[keys[i]];
  }

  let updatedInfo = await buildingsCollection.findOneAndUpdate(
    { _id: new ObjectId(buildingId) },
    { $set: building },
    { returnDocument: "after" }
  );
  if (updatedInfo.lastErrorObject.n === 0) {
    throw "could not update building successfully";
  }
  updatedInfo.value._id = updatedInfo.value._id.toString();
  return updatedInfo.value;
}

/**
 * adds roomId to a building's list of rooms
 * @param {string} buildingId - id of building to add room to
 * @param {string} roomId - id of room to add
 * @returns an object with the keys and values of the building with the newly added room
 */
async function addRoom(buildingId, roomId) {
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

  let buildingsCollection = await buildings();
  let updatedInfo = await buildingsCollection.findOneAndUpdate(
    { _id: new ObjectId(buildingId) },
    { $set: building },
    { returnDocument: "after" }
  );
  if (updatedInfo.lastErrorObject.n === 0) {
    throw "could not update building successfully";
  }
  updatedInfo.value._id = updatedInfo.value._id.toString();
  return updatedInfo.value;
}

async function removeRoom(buildingId, roomId) {
  // basic error check
  buildingId = validator.checkId(buildingId, "buildingId");
  roomId = validator.checkId(roomId, "roomId");

  // get building / check for existance
  let building = await get(buildingId);

  // update building with removed room
  let buildingsCollection = await buildings();
  delete building._id;
  let t = building["rooms"];
  let index = t.indexOf(roomId);
  if (index === -1)
    throw `room ${roomId} is not in building ${buildingId}'s rooms`;
  t.splice(index, 1);
  building["rooms"] = t;

  let updatedInfo = await buildingsCollection.findOneAndUpdate(
    { _id: new ObjectId(buildingId) },
    { $set: building },
    { returnDocument: "after" }
  );
  if (updatedInfo.lastErrorObject.n === 0) {
    throw "could not update building successfully";
  }

  // Remove room from rooms collection
  roomData.remove(roomId);

  updatedInfo.value._id = updatedInfo.value._id.toString();
  return updatedInfo.value;
}

export default {
  create,
  getAll,
  get,
  remove,
  updateBuildingProperties,
  addRoom,
  // removeRoom,
};
