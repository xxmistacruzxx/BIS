import dotenv from "dotenv-flow";

dotenv.config();
console.log(process.env);
export const mongoConfig = {
  serverUrl: `${process.env.MONGO_ADDRESS}/`,
  database: `${process.env.MONGO_DATABASE}`,
};
