# Music Discovery App - AI Coding Agent Instructions

## Architecture Overview

This is a Last.fm-powered music discovery application with Express backend and MongoDB persistence. Uses ES6 modules (`"type": "module"` in package.json) throughout.

### Core Structure
- **Backend**: Express REST API ([server/app.js](server/app.js)) with MongoDB via Mongoose
- **Controllers**: Route handlers in [server/api/controllers/](server/api/controllers/) (user, playlist, tracks)
- **Models**: [User.js](server/api/models/User.js) and [Playlist.js](server/api/models/Playlist.js) with embedded track subdocuments
- **External API**: Last.fm integration for track search ([tracks.js](server/api/controllers/tracks.js))
- **Client**: React components in [client/](client/) with Handlebars views in [client/views/](client/views/)

## Authentication & Security Patterns

**JWT-based authentication** with Bearer tokens:
- All `/playlists` routes require `verifyUser` middleware ([authorization.js](server/api/middleware/authorization.js))
- Tokens generated on login with 12h expiration ([auth.js](server/api/utils/auth.js))
- Format: `Authorization: Bearer <token>` header
- Middleware attaches `req.user` object for authenticated routes

**Password requirements** (enforced in [user.js](server/api/controllers/user.js#L39-L47)):
- Minimum 8 characters
- Must include letters and numbers
- Bcrypt hashing with 10 salt rounds

**Username handling**:
- Always normalized to lowercase and trimmed
- Case-insensitive uniqueness checks using regex: `{ $regex: `^${username}$`, $options: 'i' }`

## Data Model Conventions

### User Schema ([User.js](server/api/models/User.js))
- Username: lowercase, trimmed, matches `/^[A-Za-z0-9_\-.]{1,16}$/`
- Password field automatically stripped via `toJSON` transform
- Helper function `sanitize()` in user controller removes password before responses

### Playlist Schema ([Playlist.js](server/api/models/Playlist.js))
- Embeds tracks as subdocuments (not references)
- Each track requires: `track`, `artist`, `mbid` (MusicBrainz ID)
- User ownership via `user_id` ObjectId reference
- Duplicate titles prevented per user (case-insensitive)

## Last.fm API Integration

**Search endpoint** ([tracks.js](server/api/controllers/tracks.js#L18)):
- Query param `track` required, `fuzzy=true` optional
- Fuzzy search uses Fuse.js with 0.8 threshold on track/artist names
- Returns only tracks with valid `mbid` (MusicBrainz IDs)
- API key from `process.env.LASTFM_API_KEY`

**Response sanitization**:
```javascript
// Always extract image from Last.fm's array format
const imageObj = Array.isArray(t.image) ? t.image.find(i => i['#text']) : null;
```

## Critical Development Workflows

**Start dev server**:
```bash
npm run dev  # Uses nodemon on server/app.js
```

**Environment variables** (required in `.env`):
- `DB_USER`, `DB_PASSWORD`, `DB_URL`, `DB_NAME` - MongoDB Atlas credentials
- `JWT_SECRET` - Token signing key
- `LASTFM_API_KEY` - Last.fm API access

**Database connection**:
- MongoDB Atlas connection via [connection.js](server/db/connection.js)
- Graceful shutdown handlers for SIGTERM/SIGINT ([app.js](server/app.js#L37-L48))
- Server only starts after successful DB connection

## Common Patterns

**Error responses**: Always JSON with `{ error: 'message' }` structure

**Controller validation flow**:
1. Check required fields → 400 Bad Request
2. Verify authorization → 401 Unauthorized
3. Check resource existence → 404 Not Found
4. Validate uniqueness → 409 Conflict

**Lowercase normalization**:
```javascript
const normalized = username.toLowerCase().trim();
const existing = await User.findOne({ username: normalized });
```

**Case-insensitive MongoDB queries**:
```javascript
// For exact match
{ username: caseInsensitiveUsername }

// For duplicate checks
{ title: { $regex: `^${trimmedTitle}$`, $options: 'i' } }
```
