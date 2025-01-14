import mongoose, { Mongoose } from "mongoose";

// The connection string (ensure this is in your .env file)
const MONGO_URL = process.env.MONGO_URL as string;

if (!MONGO_URL) {
  throw new Error("MONGO_URL environment variable is not defined");
}

// Explicitly define the global type for mongoose
declare global {
  var mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null };
}

global.mongoose = global.mongoose || { conn: null, promise: null };

export async function dbConnect() {
  try {
    // If the connection exists, reuse it
    if (global.mongoose.conn) {
      console.log("Connected from previous");
      return global.mongoose.conn;
    } else {
      const promise = mongoose.connect(MONGO_URL);

      // Store the promise and connection in the global object
      global.mongoose.conn = await promise;
      global.mongoose.promise = promise;

      console.log("Newly connected");
      return global.mongoose.conn;
    }
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw new Error("Database connection failed");
  }
}

// Disconnect the database
export const disconnect = async () => {
  if (!global.mongoose.conn) {
    console.log("No active database connection to disconnect");
    return;
  }

  await mongoose.disconnect();
  global.mongoose.conn = null;
  console.log("Database disconnected");
};
