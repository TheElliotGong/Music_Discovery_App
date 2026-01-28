import axios from 'axios';
import Fuse from 'fuse.js';
import express, { type Request, type Response } from 'express';

const router = express.Router();
const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

const _plusjoin = (str: string) => {
  return str.split(' ').join('+');
};

/**
 * Search for tracks by name, optionally using fuzzy matching.
 * Query parameters:
 * - track (required): The name of the track to search for.
 * - fuzzy (optional): If 'true', enables fuzzy matching on track and artist names.
 */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { track, fuzzy } = req.query;

    const trackQuery = typeof track === 'string' ? track : Array.isArray(track) ? track[0] : '';

    // Validate required query parameters and API key.
    if (!trackQuery) {
      res.status(400).json({ error: 'Missing required query parameter: track' });
      return;
    }
    if (!LASTFM_API_KEY) {
      res.status(500).json({ error: 'Server missing Last.fm API key' });
      return;
    }
    // Construct Last.fm API request parameters and perform request
    const formatted = _plusjoin(String(trackQuery));
    const search = fuzzy === 'true' ? `${formatted}*` : formatted;

    const params = {
      method: 'track.search',
      api_key: LASTFM_API_KEY,
      track: search,
      format: 'json',
    };
    const { data } = await axios.get(LASTFM_API_URL, { params });
    // Basic validation of Last.fm response structure.
    if (!data) {
      res.status(502).json({ error: 'Invalid response from Last.fm' });
      return;
    }
    // Last.fm can return an error object in the JSON payload
    if (data.error) {
      res.status(502).json({ error: data.message || 'Last.fm returned an error' });
      return;
    }
    // Validate presence of expected search results structure
    if (!data.results || !data.results.trackmatches) {
      res.status(502).json({ error: 'Unexpected response structure from Last.fm' });
      return;
    }
    // Extract track matches, ensuring it's always an array
    const rawTracks = data?.results?.trackmatches?.track || [];
    const trackList = Array.isArray(rawTracks) ? rawTracks : [rawTracks];

    // sanitize results to minimal shape expected by the README / app
    const sanitize = (t: Record<string, any>) => {
      // Last.fm returns images as array of objects with '#text' (url) and 'size' properties
      let imageUrl = '';

      if (Array.isArray(t.image) && t.image.length > 0) {
        // Prefer higher quality images: extralarge > large > medium > small
        const preferredSizes = ['extralarge', 'large', 'medium', 'small'];

        for (const size of preferredSizes) {
          const imageObj = t.image.find((img: Record<string, any>) => img.size === size && img['#text']);
          if (imageObj) {
            imageUrl = imageObj['#text'];
            break;
          }
        }

        // Fallback: take any image with a URL if preferred sizes not found
        if (!imageUrl) {
          const anyImageObj = t.image.find((img: Record<string, any>) => img['#text']);
          imageUrl = anyImageObj ? anyImageObj['#text'] : 'N/A';
        }
      }

      return {
        name: t.name || t.title || 'N/A',
        artist: (t.artist && (typeof t.artist === 'string' ? t.artist : t.artist.name)) || '',
        url: t.url || 'N/A',
        mbid: t.mbid || null,
        image: imageUrl,
      };
    };

    // Map and sanitize all results first so fuzzy search operates on consistent keys
    let results = trackList.map(sanitize);

    // Filter out tracks without a valid mbid
    results = results.filter((r) => r.mbid && String(r.mbid).trim() !== '');
    // If fuzzy matching is requested, apply Fuse.js to the results
    if (fuzzy === 'true') {
      const fuse = new Fuse(results, {
        keys: ['track', 'artist'],
        threshold: 0.8, // smaller = stricter match; larger = fuzzier
      });

      results = fuse.search(trackQuery).map((r) => r.item);
    }
    console.log(results);
    res.status(200).json(results);
  } catch (err: any) {
    console.error('Last.fm search error:', err?.response?.data || err?.message || err);
    res.status(500).json({ error: 'Failed to search for tracks via Last.fm API' });
  }
});

/**
 * Get detailed track info by MusicBrainz ID (mbid).
 * Path parameter:
 * - mbid (required): The MusicBrainz ID of the track to retrieve.
 */
router.get('/:mbid', async (req: Request<{ mbid: string }>, res: Response): Promise<void> => {
  try {
    const { mbid } = req.params;

    // Validate required path parameter and API key
    if (!mbid) {
      res.status(400).json({ error: 'Missing required path parameter: mbid' });
      return;
    }
    if (!LASTFM_API_KEY) {
      res.status(500).json({ error: 'Server missing Last.fm API key' });
      return;
    }

    // Construct Last.fm API request parameters and perform request
    const params = {
      method: 'track.getInfo',
      api_key: LASTFM_API_KEY,
      mbid,
      format: 'json',
    };
    const { data } = await axios.get(LASTFM_API_URL, { params });
    // Basic validation of Last.fm response structure
    if (!data) {
      res.status(502).json({ error: 'Invalid response from Last.fm' });
      return;
    }
    // Last.fm can return an error object in the JSON payload
    if (data.error) {
      const status = data.error === 6 ? 404 : 400; // 6 is often "track not found"
      res.status(status).json({ error: data.message || 'Last.fm returned an error' });
      return;
    }
    // Validate presence of track data
    const t = data.track;
    if (!t) {
      res.status(404).json({ error: 'Track not found' });
      return;
    }
    // Extract image: Last.fm sometimes nests images under track.image or track.album.image
    const imageCandidates = Array.isArray(t.image) ? t.image : Array.isArray(t.album?.image) ? t.album.image : [];
    const imageObj = Array.isArray(imageCandidates) ? imageCandidates.find((i) => i['#text']) : null;
    const imageUrl = imageObj ? imageObj['#text'] : '';

    const artistName = t.artist && (typeof t.artist === 'string' ? t.artist : t.artist.name || '');
    const albumName = (t.album && (t.album.title || t.album['#text'] || t.album.name)) || '';
    // sanitize to minimal shape expected by the README / app
    const sanitized = {
      track: t.name || t.title || '',
      artist: artistName || '',
      album: albumName,
      mbid: t.mbid || mbid || null,
      image: imageUrl,
    };

    res.status(200).json(sanitized);
  } catch (err: any) {
    console.error('Last.fm track.getInfo error:', err?.response?.data || err?.message || err);
    res.status(500).json({ error: 'Failed to get track info via Last.fm API' });
  }
});

export default router;