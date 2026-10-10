const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/echosense-ai';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500, // Fast failover if MongoDB isn't running locally
    });
    isConnected = true;
    console.log(`[EchoSense DB] Connected to MongoDB host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[EchoSense DB] Notice: Could not connect to MongoDB at ${uri}.`);
    console.warn(`[EchoSense DB] Switching to resilient In-Memory Dev Store for development & demo testing.`);
    console.warn(`[EchoSense DB] To use persistent MongoDB, install MongoDB Community Server or set MONGODB_URI in .env.`);
    return false;
  }
};

const getDbStatus = () => isConnected;

module.exports = { connectDB, getDbStatus };
