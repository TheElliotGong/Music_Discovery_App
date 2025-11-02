import express from 'express';
import 'dotenv/config';
import playlists from './api/routes/playlists.js';
import tracks from './api/routes/tracks.js';
import users from './api/routes/users.js';
const port = 3000;
const app = express();

// Parse JSON and URL-encoded bodies
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true }));

app.use('/playlists', playlists);
app.use('/tracks', tracks);
app.use('/users', users);


app.listen(port, () => {
    console.log(`Server started on ${port}`);
})