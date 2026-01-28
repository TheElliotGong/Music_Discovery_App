import express, { type Request, type Response } from 'express';
import User from '../models/User.js';
import { hash, compare, signToken } from '../utils/auth.js';
import { verifyUser } from '../middleware/authorization.js';

const router = express.Router();

type UserBody = {
  username?: string;
  password?: string;
};

// A helper function to remove the password field from user objects before sending them in responses
const sanitize = (user: { toObject?: () => Record<string, unknown> } | null) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : user;
  const { password, ...rest } = userObj as { password?: unknown };
  return rest;
};

/**
 * Register a new user.
 * Expects 'username' and 'password' in the request body.
 * Ensures the username is unique (case-insensitive).
 * Returns the created user object without the password field.
 */
router.post('/register', async (req: Request<{}, {}, UserBody>, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    // Validate required fields
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required to register.' });
      return;
    }
    // Ensure username is unique (case-insensitive) and trimmed
    const caseInsensitiveUsername = username.toLowerCase().trim();
    // Ensure username is not empty after trimming
    if (caseInsensitiveUsername.length === 0) {
      res.status(400).json({ error: 'Username cannot be empty or whitespace only' });
      return;
    }
    // Check if username already exists
    const existingUser = await User.exists({ username: caseInsensitiveUsername });
    if (existingUser) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }

    // Ensure password meets basic complexity requirements
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      res.status(400).json({ error: 'Password must include letters and numbers' });
      return;
    }
    // Add the new user to the mongodb database
    const hashedPassword = await hash(password);
    const newUser = new User({ password: hashedPassword, username: caseInsensitiveUsername });
    await newUser.save();

    res.status(201).json(sanitize(newUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.put('/edit/:id', verifyUser, async (req: Request<{ id: string }, {}, UserBody>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;
    // Only allow users to edit their own profile
    if (!req.user || req.user._id.toString() !== id) {
      res.status(403).json({ error: 'Forbidden: You are not authorized to edit this user.' });
      return;
    }
    const updates: Record<string, unknown> = {};
    if (username) {
      const trimmedUsername = String(username).toLowerCase().trim();
      if (trimmedUsername.length === 0) {
        res.status(400).json({ error: 'Username cannot be empty or whitespace only' });
        return;
      }
      // Check for username uniqueness
      const existingUser = await User.findOne({ username: trimmedUsername, _id: { $ne: id } });
      if (existingUser) {
        res.status(400).json({ error: 'Username already exists' });
        return;
      }
      updates.username = trimmedUsername;
    }
    if (password) {
      if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }
      if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
        res.status(400).json({ error: 'Password must include letters and numbers' });
        return;
      }
      updates.password = await hash(password);
    }
    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json(sanitize(updatedUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * Login a user.
 * Expects 'username' and 'password' in the request body.
 * Validates credentials and returns the user object without the password field.
 */
router.post('/login', async (req: Request<{}, {}, UserBody>, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    // Validate required fields
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required to login.' });
      return;
    }
    // Ensure user exists and password matches
    const normalized = username.toLowerCase().trim();
    const user = await User.findOne({ username: normalized });
    const isValid = user && (await compare(password, user.password));
    // Handle invalid credentials
    if (!isValid || !user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const token = signToken({ username: user.username, id: user._id });
    res.status(200).json({
      access_token: token,
      token_type: 'Bearer',
      user: sanitize(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to login user' });
  }
});

/**
 * Get user details by ID.
 * Requires 'Authentication' header with the user ID.
 * Validates that the requested ID matches the authenticated user ID.
 */
router.get('/:id', verifyUser, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user || req.user._id.toString() !== id) {
      res.status(403).json({ error: 'Forbidden: You are not authorized to view this user.' });
      return;
    }

    // Return the authenticated user (sanitized)
    res.status(200).json(sanitize(req.user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;