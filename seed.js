import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import * as users from "./data/users.js";
import * as buildings from "./data/buildings.js";
import * as rooms from "./data/rooms.js";
import * as containers from "./data/containers.js";
import * as items from "./data/items.js";

const db = await dbConnection();
await db.dropDatabase();

const favardinUser = await users.create(
  "nfavardin1",
  "Password!123",
  "nfavardin@stevens.edu",
  "Nariman",
  "Farvardin"
);

const hillUser = await users.create(
  "phill2",
  "Password!123",
  "phill@stevens.edu",
  "Patrick",
  "Hill"
);

const cruzUser = await users.create(
  "dcruz3",
  "Password!123",
  "dcruz@stevens.edu",
  "David",
  "Cruz"
);

console.log("Users created.");

const howeBuilding = await buildings.create(
  favardinUser._id,
  "Wesley J. Howe Center",
  "This 14-story high rise, undoubtedly the tallest building on the Stevens campus, is the hub of administrative and student activities.",
  "1 Castle Point Terrace",
  "Hoboken",
  "NJ",
  "07030",
  true
);

const easBuilding = await buildings.create(
  favardinUser._id,
  "Edwin A. Stevens Hall",
  "Named in honor of the university’s founder, the Edwin A. Stevens Hall (EAS) serves as the home of the Charles V. Schaefer, Jr. School of Engineering & Science (SES)",
  "1 Castle Point Terrace",
  "Hoboken",
  "NJ",
  "07030",
  true
);

const mpkBuilding = await buildings.create(
  favardinUser._id,
  "MPK Building",
  "The Morton-Peirce-Kidde (MPK) complex is home to the College of Arts and Letters (CAL), which offers both undergraduate and graduate programs in the arts, humanities, and science & technology.",
  "1 Castle Point Terrace",
  "Hoboken",
  "NJ",
  "07030",
  true
);

const burchardBuilding = await buildings.create(
  hillUser._id,
  "Burchard Building",
  "The Burchard Building hosts classes and faculty offices for the Department of Physics, Department of Electrical and Computer Engineering and the Department of Chemical Engineering and Materials Science.",
  "1 Castle Point Terrace",
  "Hoboken",
  "NJ",
  "07030",
  true
);

const alphaBuilding = await buildings.create(
  cruzUser._id,
  "Lodge",
  "Alpha Xi of Chi Psi",
  "804 Castle Point Terrace",
  "Hoboken",
  "NJ",
  "07030",
  false
);

const hudsonBuilding = await buildings.create(
  cruzUser._id,
  "The Patrician",
  "One of Hudson Dorms' many apartment buildings.",
  "406 Jefferson Street",
  "Hoboken",
  "NJ",
  "07030",
  false
);

console.log("Buildings created.");

const bissingerRoom = await rooms.create(
  howeBuilding._id,
  "Bissinger Room",
  "The Bissinger Room is a large, multi-purpose room located on the second floor of the Howe Center. It is used for a variety of events, including lectures, meetings, and banquets."
);

const storeRoom = await rooms.create(
  howeBuilding._id,
  "Stevens Campus Store",
  "The Stevens Campus Store is located on the first floor of the Howe Center. It sells a variety of Stevens merchandise, including apparel, accessories, and gifts."
);

const auditoriumRoom = await rooms.create(
  easBuilding._id,
  "DeBaun Auditorium",
  "DeBaun Auditorium is an auditorium located on the first floor of the Edwin A. Stevens Hall. It is used for a variety of events, including lectures, meetings, and performances."
);

const e011Room = await rooms.create(
  easBuilding._id,
  "EAS 011",
  "EAS 011 is a lab located on the ground floor of the Edwin A. Stevens Hall. It is used for engineering design classes."
);

const k228Room = await rooms.create(
  mpkBuilding._id,
  "K 228",
  "K 228 is a large lecture hall located in the Kidde Hall. It is used for a variety of classes."
);

const p116Room = await rooms.create(
  mpkBuilding._id,
  "P 116",
  "P 116 is a lecture hall located in the Peirce Building. It is used for a variety of classes."
);

const b111Room = await rooms.create(
  burchardBuilding._id,
  "Burchard 111",
  "Burchard 111 is a large lecture hall located on the first floor of the Burchard Building. It is used for a variety of classes."
);

const officeRoom = await rooms.create(
  burchardBuilding._id,
  "Teacher Offices",
  "The teacher offices are spread across all floors of the Burchard Building."
);

const diningRoom = await rooms.create(
  alphaBuilding._id,
  "Dining Room",
  "Connected to foyer and dish room."
);

const livingRoom = await rooms.create(
  hudsonBuilding._id,
  "Living Room",
  "Connected to the entrance and kitchen."
);

console.log("Rooms created.");

const chairContainer = await containers.create(
  bissingerRoom._id,
  "Chair Rack",
  "A rack of chairs."
);

const shelfContainer = await containers.create(
  storeRoom._id,
  "Shelf",
  "A shelf of Stevens merchandise."
);

const workbenchContainer = await containers.create(
  e011Room._id,
  "Workbench",
  "A workbench for engineering design classes."
);

const whiteboardContainer = await containers.create(
  p116Room._id,
  "Whiteboard",
  "A whiteboard for classes."
);

const deskContainer = await containers.create(
  k228Room._id,
  "Desk",
  "A desk for classes."
);

const desk2Container = await containers.create(
  b111Room._id,
  "Desk",
  "A desk for classes."
);

const cabinetContainer = await containers.create(
  officeRoom._id,
  "Cabinet",
  "A cabinet to store paperwork."
);

const amazonContainer = await containers.create(
  diningRoom._id,
  "Amazon Delivery Box",
  "A box for Amazon deliveries."
);

const tvContainer = await containers.create(
  livingRoom._id,
  "TV Stand",
  "A stand for a TV."
);

console.log("Containers created.");

const chair = await items.create(
  chairContainer._id,
  "container",
  "Chair",
  "A metal chair.",
  100,
  5
);

const table = await items.create(
  bissingerRoom._id,
  "room",
  "Table",
  "A wooden table.",
  10,
  10
);

const shirt = await items.create(
  shelfContainer._id,
  "container",
  "T-Shirt",
  "A Stevens T-Shirt.",
  20,
  20
);

const mug = await items.create(
  shelfContainer._id,
  "container",
  "Mug",
  "A Stevens mug.",
  5,
  5
);

const register = await items.create(
  storeRoom._id,
  "room",
  "Register",
  "A cash register.",
  2,
  80
);

const stagelights = await items.create(
  auditoriumRoom._id,
  "room",
  "Stage Lights",
  "A set of stage lights.",
  5,
  100
);

const projector = await items.create(
  auditoriumRoom._id,
  "room",
  "Projector",
  "A projector.",
  1,
  200
);

const screwdriver = await items.create(
  workbenchContainer._id,
  "container",
  "Screwdriver",
  "A screwdriver.",
  10,
  10
);

const wires = await items.create(
  workbenchContainer._id,
  "container",
  "Wires",
  "A bundle of wires.",
  150,
  1
);

const marker = await items.create(
  whiteboardContainer._id,
  "container",
  "Marker",
  "A marker.",
  3,
  5
);

const eraser = await items.create(
  whiteboardContainer._id,
  "container",
  "Eraser",
  "An eraser.",
  2,
  5
);

const pencil = await items.create(
  deskContainer._id,
  "container",
  "Pencil",
  "A pencil.",
  1,
  1
);

const pen = await items.create(
  desk2Container._id,
  "container",
  "Pen",
  "A pen.",
  1,
  1
);

const studenttests = await items.create(
  cabinetContainer._id,
  "container",
  "Student Tests",
  "Student tests that need grading.",
  100,
  1
);

const nerfgun = await items.create(
  amazonContainer._id,
  "container",
  "Nerf Gun",
  "A Nerf Blaster 2000.",
  3,
  20
);

const bell = await items.create(
  diningRoom._id,
  "room",
  "Bell",
  "A dinner bell.",
  1,
  100
);

const tv = await items.create(
  tvContainer._id,
  "container",
  "TV",
  "A TV.",
  1,
  200
);

const games = await items.create(
  tvContainer._id,
  "container",
  "Games",
  "A set of board games.",
  5,
  20
);

const couch = await items.create(
  livingRoom._id,
  "room",
  "Couch",
  "A couch.",
  1,
  100
);

console.log("Items created.");

await users.addBuildingRelation(
  favardinUser._id,
  "buildingManageAccess",
  burchardBuilding._id
);
await users.addBuildingRelation(
  favardinUser._id,
  "buildingViewAccess",
  alphaBuilding._id
);
await users.addBuildingRelation(
  favardinUser._id,
  "buildingFavorites",
  howeBuilding._id
);
await users.addBuildingRelation(
  hillUser._id,
  "buildingViewAccess",
  howeBuilding._id
);
await users.addBuildingRelation(
  hillUser._id,
  "buildingViewAccess",
  easBuilding._id
);
await users.addBuildingRelation(
  hillUser._id,
  "buildingViewAccess",
  mpkBuilding._id
);
await users.addBuildingRelation(
  hillUser._id,
  "buildingFavorites",
  burchardBuilding._id
);
await users.addBuildingRelation(
  cruzUser._id,
  "buildingViewAccess",
  easBuilding._id
);
await users.addBuildingRelation(
  cruzUser._id,
  "buildingViewAccess",
  mpkBuilding._id
);
await users.addBuildingRelation(
  cruzUser._id,
  "buildingViewAccess",
  burchardBuilding._id
);
await users.addBuildingRelation(
  cruzUser._id,
  "buildingFavorites",
  alphaBuilding._id
);

console.log("View/Manage/Favorite access added.");
console.log("Done!");
await closeConnection();
