import axios from 'axios';
import express from 'express'
import { Playlist} from '../../db/mocks.js';
const router = express.Router();
/**
 * Get all playlists for the authenticated user.
 * Requires Authentication header with user ID.
 */
router.get('/', (req, res) => {
    try {
        const userId = req.headers.authorization;
        if (!userId) {
            return res.status(401).json({ error: 'Authorization header not present.' });
        }
        // Fetch playlists for the user
        const populated = Playlist.populate(parseInt(userId, 10));

        res.json(populated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to get playlist' });
    }
});
/**
 * Create a new playlist.
 * Requires 'title' in the request body and Authentication header with user ID.
 * Validates that the user exists and that no playlist with the same title exists for that user.
 */
router.post('/', async (req, res) => {
    try {
        const { title } = req.body;
        // Validate required title field
        if (!title) {
            return res.status(400).json({ error: 'Playlist title is required.' });
        }
        // Accept Authentication header case-insensitively
        const userID = req.get('Authentication') || req.headers['authentication'];
        if (!userID) {
            return res.status(403).json({ error: 'Forbidden: Missing Authentication header' });
        }
        // Validate and parse user ID from header
        const parsedUserID = parseInt(String(userID).trim(), 10);
        // if (Number.isNaN(parsedUserID)) {
        //     return res.status(400).json({ error: 'Invalid Authentication header value' });
        // }
        // //Ensure user exists
        // const user = User.find('_id', parsedUserID);
        // if (!user) {
        //     return res.status(404).json({ error: 'The user could not be found.' });
        // }
        // //Check if playlist with same title already exists for this user
        // const existing = Playlist.playlists.find((p) => p.title === title && p.user_id === parsedUserID);
        // if (existing) {
        //     return res.status(409).json({ error: 'A playlist with this title already exists for the user.' });
        // }
        // Create new playlist and add it to the mock database
        const data = {
            title,
            user_id: parsedUserID,
            tracks: []
        };
        const addedPlaylist = Playlist.insert(data);
        return res.status(201).json(addedPlaylist);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create playlist.' });
    }

})
/**
 * Add a track to a playlist by playlist ID.
 * Requires Authentication header with user ID.
 * Validates that the user owns the playlist before adding.
 * Expects track details in the request body.
 */
router.put('/:_id', async (req, res) => {
    try {
        // Accept Authentication header case-insensitively
        const userID = req.get('Authentication') || req.headers['authentication'] || req.headers.authorization;
        if (!userID) {
            return res.status(403).json({ error: 'Forbidden: Missing Authentication header' });
        }
        // Validate and parse user ID from header
        const parsedUserID = parseInt(String(userID).trim(), 10);
        if (Number.isNaN(parsedUserID)) {
            return res.status(400).json({ error: 'Invalid Authentication header value' });
        }

        // Validate playlist id param
        const _idParam = req.params._id;
        const playlistID = parseInt(String(_idParam).trim(), 10);
        if (Number.isNaN(playlistID)) {
            return res.status(400).json({ error: 'Invalid playlist id' });
        }
        // Ensure user exists
        // const user = User.find('_id', parsedUserID);
        // if (!user) {
        //     return res.status(404).json({ error: 'The user could not be found.' });
        // }
        //Ensure playlist exists
        const playlist = Playlist.find('_id', playlistID);
        if (!playlist) {
            return res.status(404).json({ error: 'The playlist could not be found.' });
        }

        // Ensure the authenticated user owns this playlist
        if (playlist.user_id !== parsedUserID) {
            return res.status(403).json({ error: 'Forbidden: You do not own this playlist' });
        }
        // Validate required track fields in body
        const { track, artist, album, mbid, image } = req.body;
        if (!track || !artist || !album || !mbid || !image) {
            return res.status(400).json({ error: 'Missing required track fields: track, artist, album, mbid, image' });
        }
        // Add track to playlist if not already present
        const data = { track, artist, album, mbid, image };
        const updated = Playlist.addToSet(playlistID, data);
        return res.status(200).json(updated);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update playlist.' });
    }
});
/**
 * Delete a playlist by ID.
 * Requires Authentication header with user ID.
 * Validates that the user owns the playlist before deleting.
 */
router.delete('/:_id', async (req, res) => {
    try {
        // Accept Authentication header case-insensitively
        const userID = req.get('Authentication') || req.headers['authentication'] || req.headers.authorization;
        if (!userID) {
            return res.status(403).json({ error: 'Forbidden: Missing Authentication header' });
        }
        // Validate and parse user ID from header
        const parsedUserID = parseInt(String(userID).trim(), 10);
        if (Number.isNaN(parsedUserID)) {
            return res.status(400).json({ error: 'Invalid Authentication header value' });
        }

        // Validate playlist id param
        const _idParam = req.params._id;
        const playlistID = parseInt(String(_idParam).trim(), 10);
        if (Number.isNaN(playlistID)) {
            return res.status(400).json({ error: 'Invalid playlist id' });
        }
        // Ensure user exists
        // const user = User.find('_id', parsedUserID);
        // if (!user) {
        //     return res.status(404).json({ error: 'The user could not be found.' });
        // }
        //Ensure playlist exists
        const playlist = Playlist.find('_id', playlistID);
        if (!playlist) {
            return res.status(404).json({ error: 'The playlist could not be found.' });
        }

        // Ensure the authenticated user owns this playlist
        if (playlist.user_id !== parsedUserID) {
            return res.status(403).json({ error: 'Forbidden: You do not own this playlist' });
        }
        const result = Playlist.delete(playlistID);
        return res.status(200).json({ message: 'Playlist deleted successfully.', _id: result._id });

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete playlist.' });
    }

});
export default router;