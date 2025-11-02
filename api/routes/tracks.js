import axios from 'axios';
import Fuse from 'fuse.js';
import express from 'express'

const router = express.Router();
const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_API_KEY = process.env.API_KEY;
/**
 * Search for tracks by name, optionally using fuzzy matching.
 * Query parameters:
 * - track (required): The name of the track to search for.
 * - fuzzy (optional): If 'true', enables fuzzy matching on track and artist names.
 */
router.get('/search', async (req, res) => {
    try {
        const { track, fuzzy } = req.query;
        //Validate required query parameters and API key.
        if (!track) {
            return res.status(400).json({ error: 'Missing required query parameter: track' });
        }
        if (!LASTFM_API_KEY) {
            return res.status(500).json({ error: 'Server missing Last.fm API key' });
        }
        // Construct Last.fm API request parameters and perform request
        const params = {
            method: 'track.search',
            api_key: LASTFM_API_KEY,
            track,
            format: 'json'
        };
        const { data } = await axios.get(LASTFM_API_URL, { params });
        // Basic validation of Last.fm response structure.
        if (!data) {
            return res.status(502).json({ error: 'Invalid response from Last.fm' });
        }
        // Last.fm can return an error object in the JSON payload
        if (data.error) {
            return res.status(502).json({ error: data.message || 'Last.fm returned an error' });
        }
        // Validate presence of expected search results structure
        if (!data.results || !data.results.trackmatches) {
            return res.status(502).json({ error: 'Unexpected response structure from Last.fm' });
        }
        // Extract track matches, ensuring it's always an array
        const rawTracks = data?.results?.trackmatches?.track || [];
        const trackList = Array.isArray(rawTracks) ? rawTracks : [rawTracks];

        // sanitize results to minimal shape expected by the README / app
        const sanitize = (t) => {
            // Last.fm returns images as array of objects with '#text' and 'size'
            const imageObj = Array.isArray(t.image) ? t.image.find(i => i['#text']) : null;
            const imageUrl = imageObj ? imageObj['#text'] : '';

            return {
                track: t.name || t.title || '',
                artist: (t.artist && (typeof t.artist === 'string' ? t.artist : t.artist.name)) || '',
                album: t.album || '',
                mbid: t.mbid || null,
                image: imageUrl
            };
        };

        // Map and sanitize all results first so fuzzy search operates on consistent keys
        let results = trackList.map(sanitize);

        // Filter out tracks without a valid mbid
        results = results.filter(r => r.mbid && String(r.mbid).trim() !== '');
        // If fuzzy matching is requested, apply Fuse.js to the results
        if (fuzzy === 'true') {
            const fuse = new Fuse(results, {
                keys: ['track', 'artist'],
                threshold: 0.3, // smaller = stricter match; larger = fuzzier
            });

            results = fuse.search(track).map(r => r.item);
        }

        return res.status(200).json(results);

    } catch (err) {
        console.error('Last.fm search error:', err?.response?.data || err.message || err);
        return res.status(500).json({ error: 'Failed to search for tracks via Last.fm API' });
    }

});
/**
 * Get detailed track info by MusicBrainz ID (mbid).
 * Path parameter:
 * - mbid (required): The MusicBrainz ID of the track to retrieve.
 */
router.get('/:mbid', async (req, res) => {
    try {
        const { mbid } = req.params;

        // Validate required path parameter and API key
        if (!mbid) {
            return res.status(400).json({ error: 'Missing required path parameter: mbid' });
        }
        if (!LASTFM_API_KEY) {
            return res.status(500).json({ error: 'Server missing Last.fm API key' });
        }

        // Construct Last.fm API request parameters and perform request
        const params = {
            method: 'track.getInfo',
            api_key: LASTFM_API_KEY,
            mbid,
            format: 'json'
        };
        const { data } = await axios.get(LASTFM_API_URL, { params });
        // Basic validation of Last.fm response structure
        if (!data) {
            return res.status(502).json({ error: 'Invalid response from Last.fm' });
        }
        // Last.fm can return an error object in the JSON payload
        if (data.error) {
            const status = data.error === 6 ? 404 : 400; // 6 is often "track not found"
            return res.status(status).json({ error: data.message || 'Last.fm returned an error' });
        }
        // Validate presence of track data
        const t = data.track;
        if (!t) {
            return res.status(404).json({ error: 'Track not found' });
        }
        // Extract image: Last.fm sometimes nests images under track.image or track.album.image
        const imageCandidates = Array.isArray(t.image) ? t.image : (Array.isArray(t.album?.image) ? t.album.image : []);
        const imageObj = Array.isArray(imageCandidates) ? imageCandidates.find(i => i['#text']) : null;
        const imageUrl = imageObj ? imageObj['#text'] : '';

        const artistName = t.artist && (typeof t.artist === 'string' ? t.artist : (t.artist.name || ''));
        const albumName = t.album && (t.album.title || t.album['#text'] || t.album.name) || '';
        // sanitize to minimal shape expected by the README / app
        const sanitized = {
            track: t.name || t.title || '',
            artist: artistName || '',
            album: albumName,
            mbid: t.mbid || mbid || null,
            image: imageUrl
        };

        return res.status(200).json(sanitized);
    } catch (err) {
        console.error('Last.fm track.getInfo error:', err?.response?.data || err.message || err);
        return res.status(500).json({ error: 'Failed to get track info via Last.fm API' });
    }
});

export default router;