# Music Discovery App - React Frontend

A complete MERN stack application for discovering and managing music playlists using the Last.fm API.

## Features

- 🔐 User authentication (register/login with JWT)
- 📝 Create and manage playlists
- 🔍 Search tracks from Last.fm API
- ➕ Add tracks to playlists
- 🗑️ Delete playlists and remove tracks
- 📱 Responsive design for mobile and desktop

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **CSS3** - Modern styling with gradients and animations

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### External APIs
- **Last.fm API** - Music metadata and search

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Last.fm API key

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
DB_USER=your_mongodb_username
DB_PASSWORD=your_mongodb_password
DB_URL=your_mongodb_cluster_url
DB_NAME=music_discovery
JWT_SECRET=your_jwt_secret_key
LASTFM_API_KEY=your_lastfm_api_key
```

### 3. Get a Last.fm API Key

1. Go to https://www.last.fm/api/account/create
2. Create an application
3. Copy the API key to your `.env` file

### 4. Running the Application

#### Development Mode

Run the backend and frontend separately:

**Terminal 1 - Backend:**
```bash
npm run dev
```
This starts the Express server on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
npm run client
```
This starts the Vite dev server on `http://localhost:5173`

The Vite dev server will proxy API requests to the backend.

#### Production Build

```bash
# Build the React frontend
npm run build

# Start the production server
npm start
```

The server will serve the built React app and API on `http://localhost:3000`

## Project Structure

```
Music_Discovery_App/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── PlaylistList.jsx
│   │   │   ├── PlaylistView.jsx
│   │   │   └── TrackSearch.jsx
│   │   ├── context/         # React context
│   │   │   └── AuthContext.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── *.css            # Component styles
│   └── index.html
├── server/                  # Express backend
│   ├── api/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Mongoose schemas
│   │   └── utils/           # Helper functions
│   ├── db/                  # Database connection
│   └── app.js               # Express server
├── vite.config.js           # Vite configuration
└── package.json
```

## API Endpoints

### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `GET /users/:id` - Get user details (authenticated)

### Playlists
- `GET /playlists` - Get all playlists for authenticated user
- `POST /playlists` - Create new playlist
- `PUT /playlists/:id` - Add track to playlist
- `DELETE /playlists/:id` - Delete playlist
- `DELETE /playlists/:id/tracks/:trackId` - Remove track from playlist

### Tracks
- `GET /tracks/search?track=query&fuzzy=true` - Search tracks on Last.fm

## Usage Guide

### 1. Register/Login
- Open the app and create an account
- Username must be 1-16 alphanumeric characters
- Password must be at least 8 characters with letters and numbers

### 2. Create a Playlist
- Click the "+" button in the sidebar
- Enter a playlist name
- Click "Create"

### 3. Add Tracks
- Select a playlist from the sidebar
- Click "Add Track" button
- Search for a song or artist
- Click "+ Add" on any search result

### 4. Manage Playlists
- Click on a playlist to view its tracks
- Click the "×" on a track to remove it
- Click the trash icon on a playlist to delete it

## Features Explained

### Authentication
- JWT tokens stored in localStorage
- Token sent as Bearer token in Authorization header
- Auto-login on page refresh if token exists

### Playlist Management
- Case-insensitive duplicate prevention
- Embedded track subdocuments in MongoDB
- Real-time UI updates after mutations

### Track Search
- Fuzzy search using Fuse.js
- Only returns tracks with MusicBrainz IDs
- Displays album artwork from Last.fm

### Responsive Design
- Mobile-first CSS approach
- Flexible layouts for different screen sizes
- Touch-friendly buttons and interactions

## Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Ensure MongoDB Atlas allows connections from your IP
- Verify all environment variables are set

### Frontend can't connect to backend
- Ensure backend is running on port 3000
- Check Vite proxy configuration in `vite.config.js`
- Clear browser cache and localStorage

### No search results
- Verify Last.fm API key is correct
- Check that the search term matches existing music
- Fuzzy search helps with typos

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is compatible

## License

ISC

## Author

Elliot Gong
