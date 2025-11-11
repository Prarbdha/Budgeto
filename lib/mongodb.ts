/**
 * MongoDB Connection Helper
 * 
 * This file manages the MongoDB connection using Mongoose.
 * It caches the connection to prevent multiple connections in serverless environments.
 */

import mongoose from 'mongoose';

// Define the connection interface
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare global variable for caching (works in both Node.js and serverless environments)
declare global {
  var mongoose: MongooseCache | undefined;
}

// Initialize cache if it doesn't exist
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connects to MongoDB Atlas
 * Uses connection caching to prevent multiple connections in serverless functions
 * @returns Promise<mongoose> - The Mongoose connection instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // Get MongoDB URI from environment variables
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  // If we already have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If we don't have a connection promise, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
    };

    // Create connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB Atlas');
      return mongoose;
    });
  }

  try {
    // Wait for the connection to be established
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset promise on error so we can retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

