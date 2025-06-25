import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db("giftwins");
    const prizes = await db.collection("prizes").find({}).toArray();
    res.status(200).json(prizes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await client.close();
  }
} 