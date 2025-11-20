import { verify } from '../util/auth.js';
import User from '../models/User.js';
const verifyUser = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
    }
    //Check the format of the Authorization header
    const parts = authHeader.split(' ').filter(Boolean);
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Unauthorized: Invalid Authorization header format' });
    }
    // Extract the token from the Authorization header and verify it
    const token = parts[1];
    let decoded;
    try {
      decoded = verify(token); // expected payload: { id, username } OR { _id, username }
    } catch {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
    // Extract user ID from decoded token
    const userId = decoded.id || decoded._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Token missing user id' });
    }
    // Find the user in the database
    const user = User.find('_id', userId);
    if (!user) {
      // Return 401 to avoid leaking which IDs exist
      return res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
    }

    req.user = user;
    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to authorize user' });
  }
};


export { verifyUser };
