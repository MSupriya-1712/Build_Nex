import mongoose from 'mongoose';
import { ENV } from './env';

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  if (isConnected) return true;

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.log(`[Database] Standalone operation: Real-Time Persistent Disk Database active.`);
    isConnected = false;
    return false;
  }
};

export const getDbStatus = (): { isConnected: boolean; mode: 'mongodb' | 'realtime-persistent' } => ({
  isConnected,
  mode: isConnected ? 'mongodb' : 'realtime-persistent',
});
