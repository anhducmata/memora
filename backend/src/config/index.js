import dotenv from 'dotenv';
import { PineconeClient } from '@pinecone-database/pinecone';
import neo4j from 'neo4j-driver';
import { S3Client } from '@aws-sdk/client-s3';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Pinecone client
const pinecone = new PineconeClient();
await pinecone.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});

// Initialize Neo4j driver
const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize Firebase Admin
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

export const config = {
  port: process.env.PORT || 3000,
  pineconeIndex: process.env.PINECONE_INDEX || 'memories',
  s3Bucket: process.env.S3_BUCKET || 'memora-media',
  vectorDimensions: 384, // all-MiniLM-L6-v2 output dimensions
};

export {
  pinecone,
  neo4jDriver,
  s3Client,
  admin,
}; 