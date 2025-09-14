import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  id: string;
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  department: string;
  region: string;
  password: string; // This will be hashed
  photoIdUrl?: string; // S3 URL for uploaded photo ID
  invitationCode?: string;
  role: "official";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRegistration {
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  department: string;
  region: string;
  password: string;
  invitationCode?: string;
  photoId?: File;
}

export interface UserLogin {
  email: string;
  password: string;
}
