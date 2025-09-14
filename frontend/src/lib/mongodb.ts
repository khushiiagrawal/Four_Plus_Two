import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aquashield';
const MONGODB_DB = 'aquashield';

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI not found in environment variables, using default: mongodb://localhost:27017/aquashield');
}

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cached: MongoConnection | null = null;

export async function connectToDatabase(): Promise<MongoConnection> {
  if (cached) {
    return cached;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  cached = { client, db };
  return cached;
}

export async function getUsersCollection() {
  const { db } = await connectToDatabase();
  return db.collection('users');
}
