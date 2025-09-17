import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const MONGODB_DB = process.env.MONGODB_DB || "aquashield";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export interface Alert {
  _id?: string;
  title: string;
  description: string;
  location: string;
  type: "critical" | "warning" | "info";
  status: "active" | "investigating" | "completed";
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // User ID who created the alert
  metadata?: {
    originalReportId?: string;
    reportData?: any;
    source?: string;
    sentAt?: string;
  };
}

export const ALERTS_COLLECTION = "alerts";
export const LEGAL_REPORTS_COLLECTION = "legal_reports";

export interface LegalReport {
  _id?: string;
  originalReportId: string;
  title: string;
  type: string;
  severity: string;
  reportedBy: string;
  timestamp: string;
  region: string;
  status: string;
  sentAt: Date;
  sentBy: string;
  reportData: {
    age?: number;
    userID?: string;
    waterID?: string;
    symptoms?: string;
    location?: string;
    originalCreatedAt?: Date;
  };
  metadata: {
    source: string;
    originalReportId: string;
  };
}
