/* BUILDINGS DOC
_id : ObjectId -- Unique
name : string
description : string
creationDate : string, date format -- default is current date
address : string
city : string
state : string
zip : string
public : boolean
rooms : ["string", ...] -- default is empty, arr can be empty
*/
import { ObjectId } from "mongodb";
import { users, buildings } from "../config/mongoCollections.js";
import userDataFunctions from "./users.js";
import validator from "../validator.js";

/**
 *
 * @param {string} userId - the userId of the user who created the building
 * @param {string} name - the name of the building
 * @param {string} description - a description of the building
 * @param {string} address - street address of building
 * @param {string} city - city of building
 * @param {string} state - state of building
 * @param {string} zip - area code of building
 * @param {boolean} publicBuilding - whether the building can be viewed by all users
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
  // INITIAL ERROR CHECK
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

  if (typeof publicBuilding !== "boolean")
    throw `publicBuilding must be a boolean`;

  let user = await userDataFunctions.get(userId);
  let date = new Date();
  let creationDate = `${
    date.getMonth() + 1
  }\/${date.getDate()}\/${date.getFullYear()}`;
  let newBuilding = {
    name: name,
    description: description,
    creationDate: creationDate,
    address: address,
    city: city,
    state: state,
    zip: zip,
    publicBuilding: publicBuilding,
  };

  // TODO: ensure duplicate buildings can't be made

  let buildingCollection = await buildings();
  let insertInfo = await buildingCollection.insertOne(newBuilding);
  if (!insertInfo["acknowledged"] || !insertInfo["insertedId"])
    throw `could not add user`;

  let newId = insertInfo[["insertedId"]].toString();
  await userDataFunctions.addBuildingRelation(
    user._id,
    "buildingOwnership",
    newId
  );

  let building = await get(newId);
  return building;
}

async function get(id) {
  // INITIAL ERROR CHECK
  id = validator.checkId(id);

  // LOGIC
  let buildingssCollection = await buildings();
  let building = await buildingssCollection.findOne({ _id: new ObjectId(id) });
  if (building === null) throw `no user with that id`;
  building._id = building._id.toString();
  return building;
}

async function remove(id) {
  // INITIAL ERROR CHECK
  id = validator.checkId(id);

  let buildingsCollection = await buildings();
  let deletionInfo = await buildingsCollection.findOneAndDelete({
    _id: new ObjectId(id),
  });

  if (deletionInfo.lastErrorObject.n === 0) {
    throw `could not delete building with id of ${id}`;
  }

  let relations = userDataFunctions.userBuildingRelations;
  let usersCollection = await users();
  for (let i = 0; i < relations.length; i++) {
    let filter = {};
    filter[relations[i]] = { $in: [id] };
    let updateInner = {};
    updateInner[relations[i]] = id;
    await usersCollection.updateMany(filter, { $pull: updateInner });
  }

  // TODO: remove rooms in the building
  return `${deletionInfo.value.name} has been successfully deleted!`;
}

export default { create, get, remove };
