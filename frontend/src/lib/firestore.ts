import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore, Timestamp } from 'firebase-admin/firestore';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

// User interface for type safety
export interface User {
  id: string;
  name?: string;
  email?: string;
  employeeId?: string;
  designation?: string;
  department?: string;
  region?: string;
  photoIdUrl?: string;
  isAuthenticated?: boolean;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown; // Allow additional properties
}

// Initialize Firebase Admin SDK
let db: Firestore;
let msg: Messaging;

export function initializeFirestore(): Firestore {
  if (db) {
    return db;
  }

  try {
    // Check if Firebase app is already initialized
    if (getApps().length === 0) {
      // Initialize with service account credentials
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error('Missing Firebase configuration. Please check your environment variables.');
      }

      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId,
      });
    }

    db = getFirestore();
    msg = getMessaging();
    return db;
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
    throw error;
  }
}

// Collection references
export function getUsersCollection() {
  const firestore = initializeFirestore();
  return firestore.collection('users');
}

export function getReportsCollection() {
  const firestore = initializeFirestore();
  return firestore.collection('reports');
}

export function getUserReportsCollection() {
  const firestore = initializeFirestore();
  return firestore.collection('userReports');
}

export function getMessagingClient(): Messaging {
  if (!msg) {
    // Ensure app and clients are initialized
    initializeFirestore();
  }
  return msg;
}

// Helper function to convert Firestore timestamp to Date
export function convertTimestamp(timestamp: Timestamp | Date | string | number): Date {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return timestamp.toDate();
  }
  return timestamp instanceof Date ? timestamp : new Date(timestamp);
}

// Helper function to convert user data from Firestore
export function convertFirestoreUser(doc: FirebaseFirestore.DocumentSnapshot): User | null {
  if (!doc.exists) return null;
  
  const data = doc.data();
  if (!data) return null;
  
  return {
    id: doc.id, // Add the document ID
    ...data,
    createdAt: convertTimestamp(data.createdAt || new Date()),
    updatedAt: convertTimestamp(data.updatedAt || new Date()),
  } as User;
}
