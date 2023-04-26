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
import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import {
  getDocById,
  getAllDocs,
  getDocByParam,
  getAllDocsByParam,
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
 * @returns true if the userName does not exist in users collection
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
 * @returns true if the email does not exist in users collection
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
 * @returns object with keys & values of the newly added user
 */
export async function create(userName, password, email, firstName, lastName) {
  // basic error check
  userName = validator.checkUserName(userName, "userName").toLowerCase();
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
 * @returns an array of all user docs from users collection
 */
export async function getAll() {
  return await getAllDocs(users);
}

/**
 * gets a user doc by its id from users collection
 * @param {string} id - id of the user to fetch from users collection
 * @returns an object with keys & values the user fetched from users collection
 */
export async function get(id) {
  return await getDocById(users, id, "user");
}

/**
 * removes a user doc by its id from users collection. Also removes any buildings that the user owns.
 * @param {string} id - id of user to remove from users collection
 * @returns a string saying the user has been deleted
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
 * @returns an object with keys & values the user fetched from users collection
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
 * @returns an object with keys & values of the auth'd user
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
 * @returns an object with keys & new values the updated user in users collection
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
        userNameUnique(propertiesAndValues[keys[i]]);
        break;
      case "password":
        propertiesAndValues[keys[i]] = validator.checkPassword(
          propertiesAndValues[keys[i]],
          keys[i]
        );
        propertiesAndValues[keys[i]] = bcrypt.hash(password, saltRounds);
        break;
      case "email":
        propertiesAndValues[keys[i]] = validator.checkEmail(
          propertiesAndValues[keys[i]],
          keys[i]
        );
        emailUnique(keys[i]);
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
};
