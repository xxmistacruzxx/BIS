import { dbConnection } from "./mongoConnection.js";

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

export const users = getCollectionFn("users");
export const buildings = getCollectionFn("buildings");
export const rooms = getCollectionFn("rooms");
export const containers = getCollectionFn("containers");
export const items = getCollectionFn("items");
export const itemImages = getCollectionFn("itemImages");