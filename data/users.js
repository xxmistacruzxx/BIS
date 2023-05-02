/* USERS DOC 
_id : ObjectID -- unique
userName : string -- unique, only has lowercase
userNameText : string -- unique
hashedPassword : string
email : string -- unique, only has lowercase
firstName : string
lastName : string
profilePicture : string -- default is "/public/images/defaultProfilePic.jpg"
buildingOwnership : ["string", ...] -- default is empty, arr can be empty
buildingManageAccess : ["string", ...] -- default is empty, arr can be empty
buildingViewAccess : ["string", ...] -- default is empty, arr can be empty
buildingFavorites : ["string", ...] -- default is empty, arr can be empty
*/
import { users } from "../config/mongoCollections.js";
import {
  getDocById,
  getAllDocs,
  getDocByParam,
  deleteDocById,
  createDoc,
  replaceDocById,
} from "./databaseHelpers.js";
import buildingDataFunctions from "./buildings.js";
import validator from "../validator.js";
import bcrypt from "bcrypt";

const saltRounds = 12;

const userProperties = [
  "userName",
  "password",
  "email",
  "firstName",
  "lastName",
  "profilePicture",
];

export const userBuildingRelations = [
  "buildingOwnership",
  "buildingManageAccess",
  "buildingViewAccess",
  "buildingFavorites",
];

/**
 * checks if there's a user with a given username
 * @param {string} userName
 * @returns {boolean} true if the userName does not exist in users collection
 */
export async function userNameUnique(userName) {
  let usersCollection = await users();
  if (
    (await usersCollection.findOne({
      userName: userName,
    })) !== null
  )
    throw `a user already exists with the username ${userName}`;
  return true;
}

/**
 * checks if there's a user with a given email
 * @param {string} email - an email in a string
 * @returns {boolean} true if the email does not exist in users collection
 */
export async function emailUnique(email) {
  let usersCollection = await users();
  if (
    (await usersCollection.findOne({
      email: email,
    })) !== null
  )
    throw `a user already exists with the email ${email}`;
  return true;
}

/**
 * creates user doc in user's collection
 * @param {string} userName - username of new user
 * @param {string} password - hashed password of new user
 * @param {string} email - email of new user
 * @param {string} firstName - first name of new user
 * @param {string} lastName - last name of new user
 * @returns {object} with keys & values of the newly added user
 */
export async function create(userName, password, email, firstName, lastName) {
  // basic error check
  userName = validator.checkUserName(userName, "userName");
  password = validator.checkPassword(password, "hashedPassword");
  email = validator.checkEmail(email, "email");
  firstName = validator.checkName(firstName, "firstName");
  lastName = validator.checkName(lastName, "lastName");
  // check if userName and email are unique
  await userNameUnique(userName);
  await emailUnique(email);
  password = await bcrypt.hash(password, saltRounds);

  // add user to users collection
  let newUser = {
    userName: userName,
    password: password,
    email: email,
    firstName: firstName,
    lastName: lastName,
    profilePicture: "/public/images/defaultProfilePic.jpg",
    buildingOwnership: [],
    buildingManageAccess: [],
    buildingViewAccess: [],
    buildingFavorites: [],
  };
  let user = await createDoc(users, newUser, "user");
  return user;
}

/**
 * gets all user docs in users collection
 * @returns {Array} of all user docs from users collection
 */
export async function getAll() {
  return await getAllDocs(users);
}

/**
 * gets a user doc by its id from users collection
 * @param {string} id - id of the user to fetch from users collection
 * @returns {object} with keys & values the user fetched from users collection
 */
export async function get(id) {
  return await getDocById(users, id, "user");
}

/**
 * removes a user doc by its id from users collection. Also removes any buildings that the user owns.
 * @param {string} id - id of user to remove from users collection
 * @returns {string} saying the user has been deleted
 */
export async function remove(id) {
  // basic error check
  id = validator.checkId(id, "id");
  // get user / check for existance
  let user = await get(id);
  // remove buildings the user owned
  let ownedBuildingIds = user["buildingOwnership"];
  for (let i = 0; i < ownedBuildingIds.length; i++) {
    await buildingDataFunctions.remove(ownedBuildingIds[i]);
  }
  // remove user from users collection
  let deletion = await deleteDocById(users, id, "user");
  return deletion;
}

/**
 * gets a user doc from users collection by its username
 * @param {string} userName - username of user to be fetched from users collection
 * @returns {object} with keys & values the user fetched from users collection
 */
export async function getByUserName(userName) {
  // basic error check
  userName = validator.checkUserName(userName, "userName").toLowerCase();
  // get user from users collection
  let user = await getDocByParam(users, "userName", userName, "user");
  return user;
}

/**
 * checks if a userName and password pair are valid.
 * @param {string} userName - userName of user to auth
 * @param {string} password - password of user to auth
 * @throws if userName does not exist in database, or if password does not match
 * @returns {object} with keys & values of the auth'd user
 */
export async function authUser(userName, password) {
  // basic error check
  userName = validator.checkUserName(userName, "userName");
  password = validator.checkPassword(password, "password");

  // check if user exists / get hashed password
  let user = await getByUserName(userName);
  let comparison = await bcrypt.compare(password, user.password);
  if (!comparison) throw `invalid credentials`;
  delete user.password;
  return user;
}

/**
 * updates a user's properties by its id
 * @param {string} userId - the userid of the user to update
 * @param {object} propertiesAndValues - an object with keys being elems of @const userProperties and of proper values
 * @returns {object} with keys & new values the updated user in users collection
 */
export async function updateUserProperties(userId, propertiesAndValues) {
  // basic error check
  userId = validator.checkId(userId, "userId");
  if (!validator.isObject(propertiesAndValues))
    throw `propertiesAndValues must be an object`;

  let keys = Object.keys(propertiesAndValues);
  for (let i = 0; i < keys.length; i++) {
    switch (keys[i]) {
      case "userName":
        propertiesAndValues[keys[i]] = validator.checkUserName(
          propertiesAndValues[keys[i]],
          keys[i]
        );
        await userNameUnique(propertiesAndValues[keys[i]]);
        break;
      case "password":
        propertiesAndValues[keys[i]] = validator.checkPassword(
          propertiesAndValues[keys[i]],
          keys[i]
        );
        propertiesAndValues[keys[i]] = await bcrypt.hash(propertiesAndValues[keys[i]], saltRounds);
        break;
      case "email":
        propertiesAndValues[keys[i]] = validator.checkEmail(
          propertiesAndValues[keys[i]],
          keys[i]
        );
        await emailUnique(keys[i]);
        break;
      case "firstName":
        propertiesAndValues[keys[i]] = validator.checkName(
          propertiesAndValues[keys[i]],
          keys[i]
        );
        break;
      case "lastName":
        propertiesAndValues[keys[i]] = validator.checkName(
          propertiesAndValues[keys[i]],
          keys[i]
        );
        break;
      case "profilePicture":
        propertiesAndValues[keys[i]] = validator.checkString(
          propertiesAndValues[keys[i]],
          keys[i]
        );
        break;
      default:
        throw `${keys[i]} not a userProperty. Possible properties are: ${userProperties}`;
    }
  }

  // update user properties
  let user = await get(userId);
  delete user._id;
  for (let i = 0; i < keys.length; i++) {
    user[keys[i]] = propertiesAndValues[keys[i]];
  }

  let updatedUser = replaceDocById(users, userId, user, "user");
  return updatedUser;
}

/**
 * Relates a building to a user. Relation types can be found at @const userBuildingRelations
 * @param {string} userId - the user id to add a relation to
 * @param {string} relation - the relation type to add
 * @param {string} buildingId - the building id to relate to
 * @returns {object} of user with added relation
 */
export async function addBuildingRelation(userId, relation, buildingId) {
  // basic error check
  userId = validator.checkId(userId, "userId");
  relation = validator.checkString(relation, "relation");
  buildingId = validator.checkId(buildingId, "buildingId");

  if (!userBuildingRelations.includes(relation))
    throw `${relation} is not a building relation. Possible relations are: ${userBuildingRelations}`;
  await buildingDataFunctions.get(buildingId);

  // add relation to user
  let user = await get(userId);
  delete user._id;
  let t = user[relation];
  t.push(buildingId);
  user[relation] = t;
  let updatedDoc = await replaceDocById(users, userId, user, "user");
  return updatedDoc;
}

/**
 * Removes building relation from a user. Relation types can be found at @const userBuildingRelations
 * @param {string} userId - the user id to remove a relation from
 * @param {string} relation - the relation type to remove
 * @param {string} buildingId - the building id to remove the relation from
 * @throws if building is not in a user's given relation list
 * @returns {object} of user with removed relation
 */
export async function removeBuildingRelation(userId, relation, buildingId) {
  // basic error check
  userId = validator.checkId(userId, "userId");
  relation = validator.checkString(relation, "relation");
  buildingId = validator.checkId(buildingId, "buildingId");

  if (!userBuildingRelations.includes(relation))
    throw `${relation} is not a building relation. Possible relations are: ${userBuildingRelations}`;

  // remove relation from user
  let user = await get(userId);
  delete user._id;
  let t = user[relation];
  let index = t.indexOf(buildingId);
  if (index === -1)
    throw `building ${buildingId} is not in user ${userId}'s ${relation} relation`;
  t.splice(index, 1);
  user[relation] = t;

  let updatedDoc = replaceDocById(users, id, user, "user");

  // if relation was ownership, remove building from buildings collection
  if (relation === "buildingOwnership")
    buildingDataFunctions.remove(buildingId);

  return updatedDoc;
}

/**
 * creates an object representation of data related to a user.
 * @param {string} userId - the id of a user to export
 * @returns {object} with keys & values of a user where the nested buildings, rooms, containers, and items have been changed from ids to the actual objects.
 */
export async function createExport(userId) {
  // basic error check
  userId = validator.checkId(userId, "userId");
  let user = await get(userId);

  let ownershipLength = user.buildingOwnership.length;
  let manageLength = user.buildingManageAccess.length;
  let viewLength = user.buildingViewAccess.length;
  for (let i = 0; i < ownershipLength; i++) {
    user.buildingOwnership[i] = await buildingDataFunctions.createExport(
      user.buildingOwnership[i]
    );
  }
  for (let i = 0; i < manageLength; i++) {
    user.buildingManageAccess[i] = await buildingDataFunctions.createExport(
      user.buildingManageAccess[i]
    );
  }
  for (let i = 0; i < viewLength; i++) {
    user.buildingViewAccess[i] = await buildingDataFunctions.createExport(
      user.buildingViewAccess[i]
    );
  }
  return user;
}

/**
 * gets lists of buildings, rooms, containers, and items a user can view
 * @param {string} userId - id of user to get view access
 * @returns {object} an object with keys 'buildings', 'rooms', 'containers', and 'items' that are lists with strings of ids to which the user can view 
 */
export async function viewerAccessLists(userId) {
  // basic error check
  userId = validator.checkId(userId, "userId");
  let data = await createExport(userId);
  let allBuildings = [];
  for (let i of data.buildingOwnership) allBuildings.push(i);
  for (let i of data.buildingManageAccess) allBuildings.push(i);
  for (let i of data.buildingViewAccess) allBuildings.push(i);

  let buildings = [],
    rooms = [],
    containers = [],
    items = [];

  for (let building of allBuildings) {
    buildings.push(building._id);
    for (let room of building.rooms) {
      rooms.push(room._id);
      for (let container of room.containers) {
        containers.push(container._id);
        for (let item of container.items) items.push(item._id);
      }
      for (let item of room.items) items.push(item._id);
    }
  }

  let result = {
    buildings: buildings,
    rooms: rooms,
    containers: containers,
    items: items,
  };
  return result;
}

/**
 * determines whether a user has access (viewer) to an entity
 * @param {string} userId - id of user to check access
 * @param {string} type - type of entity to check access for
 * @param {string} id - id of entity to check access for
 * @returns {boolean} true if user has access to entity, false if not/entity doesn't exist
 */
export async function hasViewerAccess(userId, type, id) {
  // basic error check
  userId = validator.checkId(userId, "userId");
  type = validator.checkString(type, "type");
  const types = ["building", "room", "container", "item"];
  if (!types.includes(type))
    throw `type must be one of the following: ${types}`;
  type = type + "s";
  id = validator.checkId(id, "id");

  let access = await viewerAccessLists(userId);
  if (access[type].includes(id)) return true;
  return false;
}

export async function editAccessLists(userId) {
  // basic error check
  userId = validator.checkId(userId, "userId");
  let data = await createExport(userId);
  let allBuildings = [];
  for (let i of data.buildingOwnership) allBuildings.push(i);
  for (let i of data.buildingManageAccess) allBuildings.push(i);

  let buildings = [],
    rooms = [],
    containers = [],
    items = [];

  for (let building of allBuildings) {
    buildings.push(building._id);
    for (let room of building.rooms) {
      rooms.push(room._id);
      for (let container of room.containers) {
        containers.push(container._id);
        for (let item of container.items) items.push(item._id);
      }
      for (let item of room.items) items.push(item._id);
    }
  }

  let result = {
    buildings: buildings,
    rooms: rooms,
    containers: containers,
    items: items,
  };
  return result;
}

export async function hasEditAccess(userId, type, id) {
  // basic error check
  userId = validator.checkId(userId, "userId");
  type = validator.checkString(type, "type");
  const types = ["building", "room", "container", "item"];
  if (!types.includes(type))
    throw `type must be one of the following: ${types}`;
  type = type + "s";
  id = validator.checkId(id, "id");

  let access = await editAccessLists(userId);
  if (access[type].includes(id)) return true;
  return false;
}

export default {
  userBuildingRelations,
  create,
  getAll,
  get,
  getByUserName,
  remove,
  authUser,
  updateUserProperties,
  addBuildingRelation,
  removeBuildingRelation,
  createExport,
  viewerAccessLists,
  hasViewerAccess,
};
