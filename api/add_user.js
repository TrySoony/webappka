import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await client.connect();
    const db = client.db("giftwins");
    const user = req.body;
    const result = await db.collection("users").insertOne(user);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await client.close();
  }
} 