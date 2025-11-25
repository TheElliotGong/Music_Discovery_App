import express from 'express';
import 'dotenv/config';
import playlists from './api/routes/playlists.js';
import tracks from './api/routes/tracks.js';
import users from './api/routes/users.js';
import { connect, disconnect } from './db/connection.js';

const port = 3000;
const app = express();

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true }));

app.use('/playlists', playlists);
app.use('/tracks', tracks);
app.use('/users', users);
const start = async () => {
    try {
        // establish database connection first
        await connect();

        // start express server after successful db connection
        app.listen(port, () => {
            console.log(`server is running on localhost:${port}`);
        });
    } catch (error) {
        // log error and exit if server fails to start
        console.error('failed to start server:', error.message);
        process.exit(1);
    }
};
// graceful shutdown handler
const shutdown = async () => {
    console.log('\nshutting downy...');
    // close database connection before exiting
    await disconnect();
    process.exit(0);
};

// listen for the SIGTERM signal - common sources of SIGTERM include Docker stopping a container
process.on('SIGTERM', shutdown);
// listen for the SIGINT signal (sent when user presses Ctrl+C in the terminal)
process.on('SIGINT', shutdown);

start();


