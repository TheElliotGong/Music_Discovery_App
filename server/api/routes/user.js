import express from 'express'
import User from '../models/User.js';
import { hash, compare, signToken} from '../utils/auth.js';
import {verifyUser} from '../middleware/authorization.js';

const router = express.Router();
//A helper function to remove the password field from user objects before sending them in responses
const sanitize = (user) => {
    const userObj = user.toObject ? user.toObject() : user;
    const { password, ...rest } = userObj;
    return rest;
};
/**
 * Register a new user.
 * Expects 'username' and 'password' in the request body.
 * Ensures the username is unique (case-insensitive).
 * Returns the created user object without the password field.
 */
router.post('/register', async (req, res) => {

    try {
        const { username, password } = req.body;
        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required to register.' });
        }
        // Ensure username is unique (case-insensitive) and trimmed
        const caseInsensitiveUsername = username.toLowerCase().trim();
        //Ensure username is not empty after trimming
        if (caseInsensitiveUsername.length === 0) {
            return res.status(400).json({ error: 'Username cannot be empty or whitespace only' });
        }
        // Check if username already exists
        const existingUser = await User.exists({ username: caseInsensitiveUsername });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        //Ensure password meets basic complexity requirements
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
            return res.status(400).json({ error: 'Password must include letters and numbers' });
        }
        //Add the new user to the mongodb database
        const hashedPassword = await hash(password);
        const newUser = new User({password: hashedPassword, username: caseInsensitiveUsername});
        await newUser.save();

        return res.status(201).json(sanitize(newUser));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to register user' });
    }
});
/**
 * Login a user.
 * Expects 'username' and 'password' in the request body.
 * Validates credentials and returns the user object without the password field.
 */
router.post('/login', async (req, res) => {

    try {

        const { username, password } = req.body;
        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required to login.' });
        }
        //Ensure user exists and password matches
        const normalized = username.toLowerCase().trim();
        const user = await User.findOne({ username: normalized });
        const isValid = user && (await compare(password, user.password));
        //Handle invalid credentials
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }


        // TODO Homework 2: set authorization header with JWT
        const token = signToken({ username: user.username, id: user._id });
        return res.status(200).json({
            access_token: token,
            token_type: 'Bearer',
            user: sanitize(user)
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to login user' });
    }
});

/**
 * Get user details by ID.
 * Requires 'Authentication' header with the user ID.
 * Validates that the requested ID matches the authenticated user ID.
 */
router.get('/:id', verifyUser, async (req, res) => {
    try {
    const { id } = req.params;

     if (req.user._id.toString() !== id) {
            return res.status(403).json({ error: 'Forbidden: You are not authorized to view this user.' });
        }

    // Return the authenticated user (sanitized)
    return res.status(200).json(sanitize(req.user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get user' });
  }
});
export default router;
