import express from 'express'
import User from '../controllers/models/users.js';
import { hash, compare, sign} from '../util/auth.js';
import {verifyUser} from '../middleware/authorization.js';

const router = express.Router();
//A helper function to remove the password field from user objects before sending them in responses
const sanitize = (user) => {
    const { password, ...rest } = user;
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
        const data = {
            username: caseInsensitiveUsername,
            password: await hash(password),
        }
        const newUser = new User(data);
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

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }


        // TODO Homework 2: set authorization header with JWT
        const token = sign({ username: user.username, id: user._id });
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
// router.post('/logout', async (req, res) => {
//   try
//   {

//   }
//   catch(err)
//   {

//   }
// });
/**
 * Get user details by ID.
 * Requires 'Authentication' header with the user ID.
 * Validates that the requested ID matches the authenticated user ID.
 */
router.get('/:id', verifyUser, async (req, res) => {
    try {
        const { id } = req.params;
        // Read the 'Authentication' header in a case-insensitive way
        // const authentication = req.get('Authentication') || req.headers['authentication'];
        // // Validate presence of Authentication header
        // if (!authentication) {
        //     return res.status(403).json({ error: 'Forbidden: Missing Authentication header' });
        // }

        // // Compare header value to requested id (string compare after trimming)
        // if (String(authentication).trim() !== String(id).trim()) {
        //     return res.status(403).json({ error: 'Forbidden: You are not authorized to view this user' });
        // }
        // Validate id is a number
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        // Find user by id
        // const user = User.find('_id', parseInt(id, 10));
        // if (!user) {
        //     return res.status(404).json({ error: 'User not found' });
        // }

        return res.status(200).json(sanitize(user));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to get user' });
    }
});
export default router;
