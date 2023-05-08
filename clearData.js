import {
  users,
  buildings,
  rooms,
  containers,
  items,
  itemImages
} from "./config/mongoCollections.js";
import { closeConnection } from "./config/mongoConnection.js";

let usersCollection = await users();
let buildingsCollection = await buildings();
let roomsCollection = await rooms();
let containersCollection = await containers();
let itemsCollection = await items();
let itemImagesCollection = await itemImages();
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

try {
  await roomsCollection.drop();
  console.log("Rooms collection dropped.");
} catch (e) {
  console.log("No rooms collection found.");
}

try {
  await containersCollection.drop();
  console.log("Containers collection dropped.");
} catch (e) {
  console.log("No containers collection found.");
}

try {
  await itemsCollection.drop();
  console.log("Items collection dropped.");
} catch (e) {
  console.log("No items collection found.");
}

try {
  await itemImagesCollection.drop();
  console.log("Item images collection dropped.");
} catch (e) {
  console.log("No item images collection found.");
}

closeConnection();
