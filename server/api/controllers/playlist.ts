import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import Playlist from '../models/Playlist.js';
import { verifyUser } from '../middleware/authorization.js';

const router = express.Router();
router.use(verifyUser);

type PlaylistBody = {
  title?: string;
  newTitle?: string;
  name?: string;
  artist?: string;
  mbid?: string;
  url?: string;
  image?: string;
};

/**
 * Get all playlists for the authenticated user.
 * Requires Authentication header with user ID.
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: user context missing' });
      return;
    }
    // Fetch playlists owned by the authenticated user
    const playlists = await Playlist.find({ user_id: userId }).sort({ createdAt: -1 });
    res.status(200).json(playlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
});

/**
 * Create a new playlist.
 * Requires 'title' in the request body and Authentication header with user ID.
 * Validates that the user exists and that no playlist with the same title exists for that user.
 */
router.post('/', async (req: Request<{}, {}, PlaylistBody>, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: user context missing' });
      return;
    }

    const { title } = req.body;
    if (!title || !String(title).trim()) {
      res.status(400).json({ error: 'Playlist title is required.' });
      return;
    }
    const trimmedTitle = String(title).trim();

    // Ensure no duplicate title for this user (case-insensitive)
    const existing = await Playlist.findOne({
      user_id: userId,
      title: { $regex: `^${trimmedTitle}$`, $options: 'i' },
    });
    if (existing) {
      res.status(409).json({ error: 'A playlist with this title already exists for the user.' });
      return;
    }

    const newPlaylist = await Playlist.create({
      title: trimmedTitle,
      user_id: userId,
      tracks: [],
    });
    res.status(201).json(newPlaylist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create playlist.' });
  }
});

router.put('/rename/:_id', async (req: Request<{ _id: string }, {}, PlaylistBody>, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: user context missing' });
      return;
    }
    const playlistID = req.params._id;
    if (!mongoose.Types.ObjectId.isValid(playlistID)) {
      res.status(400).json({ error: 'Invalid playlist id' });
      return;
    }
    const { newTitle } = req.body;
    if (!newTitle || !String(newTitle).trim()) {
      res.status(400).json({ error: 'New playlist title is required.' });
      return;
    }
    const trimmedTitle = String(newTitle).trim();
    const playlist = await Playlist.findById(playlistID);
    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }
    if (!playlist.user_id.equals(userId as mongoose.Types.ObjectId)) {
      res.status(403).json({ error: 'Forbidden: You do not own this playlist' });
      return;
    }
    // Ensure no duplicate title for this user (case-insensitive)
    const existing = await Playlist.findOne({
      user_id: userId as mongoose.Types.ObjectId,
      title: { $regex: `^${trimmedTitle}$`, $options: 'i' },
      _id: { $ne: playlistID }, // exclude current playlist
    });
    if (existing) {
      res.status(409).json({ error: 'A playlist with this title already exists for the user.' });
      return;
    }
    playlist.title = trimmedTitle;
    await playlist.save();
    res.status(200).json(playlist.toJSON());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to rename playlist.' });
  }
});

/**
 * Add a track to a playlist by playlist ID.
 * Requires Authentication header with user ID.
 * Validates that the user owns the playlist before adding.
 * Expects track details in the request body.
 */
router.put('/:_id', async (req: Request<{ _id: string }, {}, PlaylistBody>, res: Response): Promise<void> => {
  try {
    // User already verified by middleware; use req.user
    const userId = req.user?._id as mongoose.Types.ObjectId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: user context missing' });
      return;
    }
    // Validate playlist id param
    const playlistID = req.params._id;
    if (!mongoose.Types.ObjectId.isValid(playlistID)) {
      res.status(400).json({ error: 'Invalid playlist id' });
      return;
    }
    // Ensure playlist exists
    const playlist = await Playlist.findById(playlistID);
    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    // Ownership check
    if (!playlist.user_id.equals(userId)) {
      res.status(403).json({ error: 'Forbidden: You do not own this playlist' });
      return;
    }
    // Validate required track fields in body
    const { name, artist, mbid, url = '', image = '' } = req.body;
    if (!name || !artist || !mbid) {
      res.status(400).json({ error: 'Missing required track fields: name, artist, mbid' });
      return;
    }

    // Prevent duplicate mbid
    const duplicate = playlist.tracks.some((t) => t.mbid === mbid);
    if (duplicate) {
      res.status(409).json({ error: 'Track with this mbid already in playlist' });
      return;
    }

    playlist.tracks.push({ name, artist, url, mbid, image });
    await playlist.save();
    res.status(200).json(playlist.toJSON());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update playlist.' });
  }
});

/**
 * Remove a track from a playlist by playlist ID and track mbid.
 * Requires Authentication header with user ID.
 * Validates that the user owns the playlist before removing.
 * Expects mbid in the request body to identify the track.
 */
router.delete('/track/:_id', async (req: Request<{ _id: string }, {}, { mbid?: string }>, res: Response): Promise<void> => {
  try {
    // User already verified by middleware; use req.user
    const userId = req.user?._id as mongoose.Types.ObjectId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: user context missing' });
      return;
    }
    // Validate playlist id param
    const playlistID = req.params._id;
    if (!mongoose.Types.ObjectId.isValid(playlistID)) {
      res.status(400).json({ error: 'Invalid playlist id' });
      return;
    }
    // Ensure playlist exists
    const playlist = await Playlist.findById(playlistID);
    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    // Ownership check
    if (!playlist.user_id.equals(userId)) {
      res.status(403).json({ error: 'Forbidden: You do not own this playlist' });
      return;
    }
    // Validate required mbid field in body
    const { mbid } = req.body;
    if (!mbid) {
      res.status(400).json({ error: 'Missing required field: mbid' });
      return;
    }

    // Find track with matching mbid
    const trackIndex = playlist.tracks.findIndex((t) => t.mbid === mbid);
    if (trackIndex === -1) {
      res.status(404).json({ error: 'Track with this mbid not found in playlist' });
      return;
    }
    // Remove track
    playlist.tracks.splice(trackIndex, 1);
    await playlist.save();
    res.status(200).json(playlist.toJSON());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove track from playlist.' });
  }
});

/**
 * Delete a playlist by ID.
 * Requires Authentication header with user ID.
 * Validates that the user owns the playlist before deleting.
 */
router.delete('/:_id', async (req: Request<{ _id: string }>, res: Response): Promise<void> => {
  try {
    // User context provided by verifyUser middleware
    const userId = req.user?._id as mongoose.Types.ObjectId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: user context missing' });
      return;
    }

    // Validate playlist id
    const playlistID = req.params._id;
    if (!mongoose.Types.ObjectId.isValid(playlistID)) {
      res.status(400).json({ error: 'Invalid playlist id' });
      return;
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistID);
    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    // Ownership check
    if (!playlist.user_id.equals(userId)) {
      res.status(403).json({ error: 'Forbidden: You do not own this playlist' });
      return;
    }

    await Playlist.findByIdAndDelete(playlistID);
    res.status(200).json({ message: 'Playlist deleted successfully.', _id: playlist._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete playlist.' });
  }
});

export default router;