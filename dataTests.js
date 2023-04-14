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

let testObjId = new ObjectId().toString();

let user = await userData.create(
  "xxmistacruzxx",
  "ABCD1234",
  "dacruz04@optonline.net",
  "David",
  "Cruz"
);

// userData.create(
//   "xxmistacruzxx",
//   "ABCD1234",
//   "dacruz04@optonline.net",
//   "David",
//   "Cruz"
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

await buildingData.remove(building._id);

user = await userData.get(user._id);
// building = await buildingData.get(building._id);
console.log(user);
// console.log(building);
closeConnection();
