import 'dotenv/config';
import mongoose from 'mongoose';

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;

const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

const connect = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('mongodb connected successfully.');
    } catch (error) {
        console.error('mongodb connection error:', error.message);
        process.exit(1);
    }
};

const disconnect = async () => {
    try {
        await mongoose.connection.close();
        console.log('mongodb disconnected successfully.');
    } catch (error) {
        console.error('mongodb disconnection error:', error.message);
    }
};

export { connect, disconnect };
