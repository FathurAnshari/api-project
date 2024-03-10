import { MongoClient } from "mongodb";

import {
  connectDatabase,
  getAllDocument,
  insertDocument,
} from "../../../helpers/db-util";

export default async function handler(req, res) {
  const eventId = req.query.eventId;

  let client;
  try {
    client = await connectDatabase();
  } catch (error) {
    res.status(500).json({ message: "Connecting to database failed" });
    return;
  }

  if (req.method === "POST") {
    const { email, name, text } = req.body;

    if (
      !email.includes("@") ||
      !name ||
      name.trim() === "" ||
      !text ||
      text.trim() === ""
    ) {
      res.status(422).json({ message: "Invalid input" });
      return;
    }

    const newComent = {
      email,
      name,
      text,
      eventId,
    };

    let result;

    try {
      result = await insertDocument(client, "comments", newComent);
      newComent._id = result.insertedId;
      res.status(201).json({ message: "Added comment", comment: newComent });
    } catch (error) {
      res.status(500).json({ message: "Insert comment failed" });
    }
  }

  if (req.method === "GET") {
    try {
      const documents = await getAllDocument(
        client,
        "comments",
        { _id: -1 },
        { eventId: eventId }
      );
      res.status(200).json({ comments: documents });
    } catch (error) {
      res.status(500).json({ message: "Getting comments failed" });
    }

    // const commentById = documents.filter((item) => item.eventId === eventId);
  }

  client.close();
}
