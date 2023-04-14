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
import { users, buildings } from "../config/mongoCollections.js";
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

async function create(userName, hashedPassword, email, firstName, lastName) {
  // INITIAL ERROR CHECK
  userName = validator.checkString(userName, "userName").toLowerCase();
  hashedPassword = validator.checkString(hashedPassword, "hashedPassword");
  email = validator.checkEmail(email, "email").toLowerCase();
  firstName = validator.checkString(firstName, "firstName");
  lastName = validator.checkString(lastName, "lastName");
  // CHECK IF USERNAME AND EMAIL ARE UNIQUE
  await userNameUnique(userName);
  await emailUnique(email);

  // LOGIC
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

async function getAll() {
  // LOGIC
  let usersCollection = await users();
  let allUsers = await usersCollection.find({}).toArray();

  for (let i = 0; i < allUsers.length; i++) {
    allUsers[i]["_id"] = allUsers[i]["_id"].toString();
  }
  return allUsers;
}

async function get(id) {
  // INITIAL ERROR CHECK
  id = validator.checkId(id, "id");

  // LOGIC
  let usersCollection = await users();
  let user = await usersCollection.findOne({ _id: new ObjectId(id) });
  if (user === null) throw `no user with that id`;
  user._id = user._id.toString();
  return user;
}

async function remove(id) {
  id = validator.checkId(id, "id");

  let userCollection = await users();
  let user = await get(id);
  let ownedBuildingIds = user["buildingOwnership"];
  let deletionInfo = await userCollection.findOneAndDelete({
    _id: new ObjectId(id),
  });

  if (deletionInfo.lastErrorObject.n === 0) {
    throw `could not delete user with id of ${id}`;
  }

  for (let i = 0; i < ownedBuildingIds.length; i++) {
    await buildingDataFunctions.remove(ownedBuildingIds[i]);
  }
  return `${deletionInfo.value.name} has been successfully deleted!`;
}

async function getByUserName(userName) {
  // INITIAL ERROR CHECK
  userName = validator.checkString(userName, "userName").toLowerCase();

  let usersCollection = await users();
  let user = await usersCollection.findOne({ userName: userName });
  if (user === null) throw `no user with that id`;
  user._id = user._id.toString();
  return user;
}

async function updateUserProperties(userId, propertiesAndValues) {
  // INITIAL ERROR CHECK
  userId = validator.checkId(userId, "userId");
  if (!validator.isObject(propertiesAndValues))
    throw `propertiesAndValues must be an object`;

  let keys = Object.keys(propertiesAndValues);
  for (let i = 0; i < keys.length; i++) {
    propertiesAndValues[keys[i]] = validator.checkString(
      propertiesAndValues[keys[i]]
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

  let usersCollection = await users();
  if (keys.includes("userName")) {
    await userNameUnique(propertiesAndValues["userName"]);
  }
  if (keys.includes("email")) {
    await emailUnique(propertiesAndValues["email"]);
  }

  // LOGIC
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
  userId = validator.checkId(userId, "userId");
  relation = validator.checkString(relation, "relation");
  buildingId = validator.checkId(buildingId, "buildingId");

  if (!userBuildingRelations.includes(relation))
    throw `${relation} is not a building relation. Possible relations are: ${userBuildingRelations}`;
  await buildingDataFunctions.get(buildingId);

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
  userId = validator.checkId(userId, "userId");
  relation = validator.checkString(relation, "relation");
  buildingId = validator.checkId(buildingId, "buildingId");

  if (!userBuildingRelations.includes(relation))
    throw `${relation} is not a building relation. Possible relations are: ${userBuildingRelations}`;

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
