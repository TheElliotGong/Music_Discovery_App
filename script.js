import 'dotenv/config';
import mongoose from 'mongoose';
import User from './api/controllers/models/users.js';
import Playlist from './api/controllers/models/playlists.js';
// load environment variables
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
 * sample script to demonstrate creating users, playlists & populating relationships
 */
const runScript = async () => {
    try {
        await connect();
        // step 1: clear existing users and playlists
        await User.deleteMany({});
        await Playlist.deleteMany({});

        // step 2: create a user
        const newUser = new User({
            username: 'captain',
            password: 'america'
        });
        await newUser.save();
        // console.log('User created:', newUser);
        // step 3: create a playlist and attach it to the user created in #2
        const newPlaylist = new Playlist({
            title: 'Avengers Mix',
            tracks: [{ mbid: 'track1', track: 'Track 1', artist: 'Artist 1', album: 'First album', image: 'url' }],
            user_id: newUser._id
        });
        await newPlaylist.save();
        // console.log('Playlist created:', newPlaylist);

        // step 4: Use the correct model to query the user (from #2) by their _id and get their associated playlists by using populate
        //Print out the query response to verify the relationship is populated correctly
        const populatedUser = await User.findById({ _id: newUser._id }).populate('playlists');
        console.log('User with populated playlists:', JSON.stringify(populatedUser.toJSON(), null, 2));

       // close the db connection
        mongoose.connection.close();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

runScript();
