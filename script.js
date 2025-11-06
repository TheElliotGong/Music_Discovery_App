import 'dotenv/config';
import mongoose from 'mongoose';

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;

/**
 * connect to mongoDB
 * constructs the mongo URI and connects using mongoose
 */
const connect = async () => {
    try {
        // mongodb+srv://admin:<db_password>@cluster0.xfnjqlx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
        const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

        await mongoose.connect(MONGO_URI);
        console.log('connected to mongoDB');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

/**
 * runScript
 * sample script to demonstrate creating users, libraries & populating relationships
 */
const runScript = async () => {
    try {
        await connect();

        // step 1: create a user
        
        // step 2: create a library

        // step 3: update the user's library collection with library _id

        // step 4: add a game to the library

        // step 5a: populate the user with their libraries

        // step 5b: populate the library with the user

        // clean up the database

        // close the db connection
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

runScript();
