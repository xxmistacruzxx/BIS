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
import { getDocById, getAllDocs } from "./databaseHelpers.js";
import buildingDataFunctions from "./buildings.js";
import validator from "../validator.js";
const userProperties = [
  "userName",
  "hashedPassword",
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
async function userNameUnique(userName) {
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
async function emailUnique(email) {
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
 * @param {string} hashedPassword - hashed password of new user
 * @param {string} email - email of new user
 * @param {string} firstName - first name of new user
 * @param {string} lastName - last name of new user
 * @returns object with keys & values of the newly added user
 */
async function create(userName, hashedPassword, email, firstName, lastName) {
  // basic error check
  userName = validator.checkString(userName, "userName").toLowerCase();
  hashedPassword = validator.checkString(hashedPassword, "hashedPassword");
  email = validator.checkEmail(email, "email").toLowerCase();
  firstName = validator.checkString(firstName, "firstName");
  lastName = validator.checkString(lastName, "lastName");
  // check if userName and email are unique
  await userNameUnique(userName);
  await emailUnique(email);

  // add user to users collection
  let newUser = {
    userName: userName,
    hashedPassword: hashedPassword,
    email: email,
    firstName: firstName,
    lastName: lastName,
    profilePicture: "/public/images/defaultProfilePic.jpg",
    buildingOwnership: [],
    buildingManageAccess: [],
    buildingViewAccess: [],
    buildingFavorites: [],
  };

  let usersCollection = await users();
  let insertInfo = await usersCollection.insertOne(newUser);
  if (!insertInfo["acknowledged"] || !insertInfo["insertedId"])
    throw `could not add user`;

  let newId = insertInfo[["insertedId"]].toString();
  let user = await get(newId);

  return user;
}

/**
 * gets all user docs in users collection
 * @returns an array of all user docs from users collection
 */
async function getAll() {
  return await getAllDocs(users);
}

/**
 * gets a user doc by its id from users collection
 * @param {string} id - id of the user to fetch from users collection
 * @returns an object with keys & values the user fetched from users collection
 */
async function get(id) {
  return await getDocById(users, id, "user");
}

/**
 * removes a user doc by its id from users collection. Also removes any buildings that the user owns.
 * @param {string} id - id of user to remove from users collection
 * @returns a string saying the user has been deleted
 */
async function remove(id) {
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
  let userCollection = await users();
  let deletionInfo = await userCollection.findOneAndDelete({
    _id: new ObjectId(id),
  });
  if (deletionInfo.lastErrorObject.n === 0) {
    throw `could not delete user with id of ${id}`;
  }

  return `${deletionInfo.value.name} has been successfully deleted!`;
}

/**
 * gets a user doc from users collection by its username
 * @param {string} userName - username of user to be fetched from users collection
 * @returns an object with keys & values the user fetched from users collection
 */
async function getByUserName(userName) {
  // basic error check
  userName = validator.checkString(userName, "userName").toLowerCase();

  // get user from users collection
  let usersCollection = await users();
  let user = await usersCollection.findOne({ userName: userName });
  if (user === null) throw `no user with that id`;
  user._id = user._id.toString();

  return user;
}

/**
 * updates a user's properties by its id
 * @param {string} userId - the userid of the user to update
 * @param {object} propertiesAndValues - an object with keys being elems of @const userProperties and of proper values
 * @returns an object with keys & new values the updated user in users collection
 */
async function updateUserProperties(userId, propertiesAndValues) {
  // basic error check
  userId = validator.checkId(userId, "userId");
  if (!validator.isObject(propertiesAndValues))
    throw `propertiesAndValues must be an object`;

  let keys = Object.keys(propertiesAndValues);
  for (let i = 0; i < keys.length; i++) {
    propertiesAndValues[keys[i]] = validator.checkString(
      propertiesAndValues[keys[i]],
      keys[i]
    );
    if (!userProperties.includes(keys[i]))
      throw `${keys[i]} is not a userProperty. Possible properties are: ${userProperties}`;
  }

  if (propertiesAndValues["email"])
    propertiesAndValues["email"] = validator.checkEmail(
      propertiesAndValues["email"]
    );
  if (propertiesAndValues["userName"])
    propertiesAndValues["userName"] =
      propertiesAndValues["userName"].toLowerCase();
  if (propertiesAndValues["email"])
    propertiesAndValues["email"] = propertiesAndValues["email"].toLowerCase();

  if (keys.includes("userName")) {
    await userNameUnique(propertiesAndValues["userName"]);
  }
  if (keys.includes("email")) {
    await emailUnique(propertiesAndValues["email"]);
  }

  // update user properties
  let usersCollection = await users();
  let user = await get(userId);
  delete user._id;
  for (let i = 0; i < keys.length; i++) {
    user[keys[i]] = propertiesAndValues[keys[i]];
  }

  let updatedInfo = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: user },
    { returnDocument: "after" }
  );
  if (updatedInfo.lastErrorObject.n === 0) {
    throw "could not update user successfully";
  }
  updatedInfo.value._id = updatedInfo.value._id.toString();
  return updatedInfo.value;
}

/**
 * Relates a building to a user. Relation types can be found at @const userBuildingRelations
 * @param {string} userId - the user id to add a relation to
 * @param {string} relation - the relation type to add
 * @param {string} buildingId - the building id to relate to
 */
async function addBuildingRelation(userId, relation, buildingId) {
  // basic error check
  userId = validator.checkId(userId, "userId");
  relation = validator.checkString(relation, "relation");
  buildingId = validator.checkId(buildingId, "buildingId");

  if (!userBuildingRelations.includes(relation))
    throw `${relation} is not a building relation. Possible relations are: ${userBuildingRelations}`;
  await buildingDataFunctions.get(buildingId);

  // add relation to user
  let usersCollection = await users();
  let user = await get(userId);
  delete user._id;
  let t = user[relation];
  t.push(buildingId);
  user[relation] = t;
  let updatedInfo = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: user },
    { returnDocument: "after" }
  );
  if (updatedInfo.lastErrorObject.n === 0) {
    throw "could not update user successfully";
  }
  updatedInfo.value._id = updatedInfo.value._id.toString();
  return updatedInfo.value;
}

/**
 * Removes building relation from a user. Relation types can be found at @const userBuildingRelations
 * @param {string} userId - the user id to remove a relation from
 * @param {string} relation - the relation type to remove
 * @param {string} buildingId - the building id to remove the relation from
 */
async function removeBuildingRelation(userId, relation, buildingId) {
  // basic error check
  userId = validator.checkId(userId, "userId");
  relation = validator.checkString(relation, "relation");
  buildingId = validator.checkId(buildingId, "buildingId");

  if (!userBuildingRelations.includes(relation))
    throw `${relation} is not a building relation. Possible relations are: ${userBuildingRelations}`;

  // remove relation from user
  let usersCollection = await users();
  let user = await get(userId);
  delete user._id;
  let t = user[relation];
  let index = t.indexOf(buildingId);
  if (index === -1)
    throw `building ${buildingId} is not in user ${userId}'s ${relation} relation`;
  t.splice(index, 1);
  user[relation] = t;

  let updatedInfo = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: user },
    { returnDocument: "after" }
  );
  if (updatedInfo.lastErrorObject.n === 0) {
    throw "could not update user successfully";
  }

  // if relation was ownership, remove building from buildings collection
  if (relation === "buildingOwnership")
    buildingDataFunctions.remove(buildingId);

  updatedInfo.value._id = updatedInfo.value._id.toString();
  return updatedInfo.value;
}

export default {
  userBuildingRelations,
  create,
  getAll,
  get,
  getByUserName,
  remove,
  updateUserProperties,
  addBuildingRelation,
  removeBuildingRelation,
};
