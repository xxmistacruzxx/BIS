import { buildingData, userData } from "./data/index.js";
import { users, buildings } from "./config/mongoCollections.js";
import { closeConnection } from "./config/mongoConnection.js";
import { ObjectId } from "mongodb";

let usersCollection = await users();
let buildingsCollection = await buildings();
try {
  await usersCollection.drop();
  console.log("Users collection dropped.");
} catch (e) {
  console.log("No users collection found.");
}

try {
  await buildingsCollection.drop();
  console.log("Buildings collection dropped.");
} catch (e) {
  console.log("No buildings collection found.");
}

let user = await userData.create(
  "xxmistacruzxx",
  "ABCD1234",
  "dacruz04@optonline.net",
  "David",
  "Cruz"
);

console.log(user);

await userData.updateUserProperties(user._id, { email: "sfosfo@gmail.com" });

// console.log(
//   await userData.addBuildingRelation(user._id, "buildingOwnership", objId)
// );

// console.log(
//   await userData.removeBuildingRelation(user._id, "buildingManageAccess", objId)
// );

let building = await buildingData.create(
  user._id,
  "Lodge",
  "Alpha Xi of Chi Psi",
  "804 Castle Point Terrace",
  "Hoboken",
  "NJ",
  "07030",
  false
);

console.log(building);

await buildingData.remove(building._id);

// userData.remove(user._id);
closeConnection();
