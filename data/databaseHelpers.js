import validator from "../validator.js";
import { ObjectId } from "mongodb";

async function getAllDocs(collectionGetter) {
  let collection = await collectionGetter();
  let allDocs = await collection.find({}).toArray();

  for (let i = 0; i < allDocs.length; i++) {
    allDocs[i]["_id"] = allDocs[i]["_id"].toString();
  }
  return allDocs;
}

async function getDocById(collectionGetter, id, docType) {
  id = validator.checkId(id, "id");

  let collection = await collectionGetter();
  let doc = await collection.findOne({ _id: new ObjectId(id) });
  if (doc === null) throw `no ${docType} with that id`;
  doc._id = doc._id.toString();
  return doc;
}

function generateCreationDate() {
  let date = new Date();
  let creationDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;
  return creationDate;
}

export { getAllDocs, getDocById, generateCreationDate };
