import express from 'express'
import Playlist from '../models/Playlist.js';
import { verifyUser } from '../middleware/authorization.js';
import mongoose from 'mongoose';
const router = express.Router();
router.use(verifyUser);

/**
 * Get all playlists for the authenticated user.
 * Requires Authentication header with user ID.
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: user context missing' });
        }
        // Fetch playlists owned by the authenticated user
        const playlists = await Playlist.find({ user_id: userId }).sort({ createdAt: -1 });
        return res.status(200).json(playlists);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to get playlists' });
    }
});
/**
 * Create a new playlist.
 * Requires 'title' in the request body and Authentication header with user ID.
 * Validates that the user exists and that no playlist with the same title exists for that user.
 */
router.post('/', async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: user context missing' });
        }

        const { title } = req.body;
        if (!title || !String(title).trim()) {
            return res.status(400).json({ error: 'Playlist title is required.' });
        }
        const trimmedTitle = String(title).trim();

        // Ensure no duplicate title for this user (case-insensitive)
        const existing = await Playlist.findOne({
            user_id: userId,
            title: { $regex: `^${trimmedTitle}$`, $options: 'i' }
        });
        if (existing) {
            return res.status(409).json({ error: 'A playlist with this title already exists for the user.' });
        }

        const newPlaylist = await Playlist.create({
            title: trimmedTitle,
            user_id: userId,
            tracks: []
        });
        return res.status(201).json(newPlaylist);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create playlist.' });
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
        // User already verified by middleware; use req.user
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: user context missing' });
        }
        // Validate playlist id param
        const playlistID = req.params._id;
        if (!mongoose.Types.ObjectId.isValid(playlistID)) {
            return res.status(400).json({ error: 'Invalid playlist id' });
        }
        // Ensure playlist exists
        const playlist = await Playlist.findById(playlistID);
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        // Ownership check
        if (!playlist.user_id.equals(userId)) {
            return res.status(403).json({ error: 'Forbidden: You do not own this playlist' });
        }
        // Validate required track fields in body
        const { track, artist, mbid, album = '', image = '' } = req.body;
        if (!track || !artist || !mbid) {
            return res.status(400).json({ error: 'Missing required track fields: track, artist, mbid' });
        }

        // Prevent duplicate mbid
        const duplicate = playlist.tracks.some(t => t.mbid === mbid);
        if (duplicate) {
            return res.status(409).json({ error: 'Track with this mbid already in playlist' });
        }

        playlist.tracks.push({ track, artist, album, mbid, image });
        await playlist.save();
        return res.status(200).json(playlist.toJSON());
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