import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './api/controllers/models/User.js';

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;

const port = 3000;
const app = express();

const connect = async () => {
    try {
        const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

        await mongoose.connect(MONGO_URI);
        console.log('connected to mongoDB');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

const runScript = async () => {
    try {
        await connect();
        const newUser = new User({
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password123'
        });
        console.log('User created:', newUser);
        
    }catch(err)
    {
        console.error('Error running script:', err);
    }
}

runScript();