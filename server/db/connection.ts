import 'dotenv/config';
import mongoose from 'mongoose';

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;

if (!DB_USER || !DB_PASSWORD || !DB_URL || !DB_NAME) {
  throw new Error('Missing required database environment variables: DB_USER, DB_PASSWORD, DB_URL, or DB_NAME');
}

const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('mongodb connected successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('mongodb connection error:', message);
    process.exit(1);
  }
};

const disconnect = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('mongodb disconnected successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('mongodb disconnection error:', message);
  }
};

export { connect, disconnect };
