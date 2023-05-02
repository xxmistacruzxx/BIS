import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import users from "./data/users.js";

const db = await dbConnection();
await db.dropDatabase();

const user1 = await users.create(
    "stang1",
    "Password!123",
    "stang@gmail.com",
    "Steve",
    "Tang"
)

const user2 = await users.create(
    "tnixon2",
    "Password!123",
    "tnixon@gmail.com",
    "Troy",
    "Nixon"
)

const user3 = await users.create(
    "jdoe3",
    "Password!123",
    "jdoe@gmail.com",
    "John",
    "Doe"
)

await closeConnection();
