import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db("giftwins");
    const users = await db.collection("users").find({}).toArray();
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await client.close();
  }
} 