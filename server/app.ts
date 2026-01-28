import express, { type Express, type Request, type Response } from 'express';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import playlists from './api/controllers/playlist.js';
import tracks from './api/controllers/tracks.js';
import users from './api/controllers/user.js';
import { connect, disconnect } from './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;
const app: Express = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app in production
app.use(express.static(path.join(__dirname, '../dist')));

// API routes
app.use('/playlists', playlists);
app.use('/tracks', tracks);
app.use('/users', users);

// Catch-all handler to serve React app for any route not handled by API
app.use((req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const start = async (): Promise<void> => {
  try {
    // establish database connection first
    await connect();

    // start express server after successful db connection
    app.listen(port, () => {
      console.log(`server is running on localhost:${port}`);
    });
  } catch (error) {
    // log error and exit if server fails to start
    const message = error instanceof Error ? error.message : String(error);
    console.error('failed to start server:', message);
    process.exit(1);
  }
};

// graceful shutdown handler
const shutdown = async (): Promise<void> => {
  console.log('\nshutting down...');
  // close database connection before exiting
  await disconnect();
  process.exit(0);
};

// listen for the SIGTERM signal - common sources of SIGTERM include Docker stopping a container
process.on('SIGTERM', shutdown);
// listen for the SIGINT signal (sent when user presses Ctrl+C in the terminal)
process.on('SIGINT', shutdown);

start();
