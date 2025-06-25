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
    const { user_id } = req.body;
    const result = await db.collection("users").updateOne(
      { user_id },
      { $set: { attempts: 0 } }
    );
    res.status(200).json({ modifiedCount: result.modifiedCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await client.close();
  }
} 