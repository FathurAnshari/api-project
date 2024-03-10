import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

export async function connectDatabase() {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MongoDb URI not found");
  }

  const client = await MongoClient.connect(mongoURI);

  return client;
}

export async function insertDocument(client, collection, document) {
  const db = client.db("events");
  const result = await db.collection(collection).insertOne(document);
  return result;
}

export async function getAllDocument(client, collection, sort, filter = {}) {
  const db = client.db("events");
  const documents = await db
    .collection(collection)
    .find(filter)
    .sort(sort)
    .toArray();

  return documents;
}
