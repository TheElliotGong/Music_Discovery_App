import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // optional: throw here so missing secret is detected at startup
  console.warn('Warning: JWT_SECRET is not set. Tokens will not be secure.');
}
/**
 * Hash a password.
 * @param {*} password The plain text password to hash.
 * @returns {Promise<string>} The hashed password.
 */
const hash = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};
/**
 * Compare a plain text password with a hashed password.
 * @param {*} password The plain text password to compare.
 * @param {*} hashedPassword The hashed password to compare against.
 * @returns {Promise<boolean>} True if the passwords match, false otherwise.
 */
const compare = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
/**
 * Signs a JWT with a given payload.
 * @param {object} payload - The data to include in the token (e.g., { _id, username }).
 * @returns {string} The signed JSON Web Token.
 */
const signToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};
/**
 * Verifies a JWT.
 * @param {string} token - The token to verify.
 * @returns {object|null} The decoded payload if valid, otherwise null.
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Get the JWT token from the request headers.
 * @param {*} req The request object.
 * @returns {string|null} The JWT token or null if not found.
 */
// const getTokenFromHeader = (req) => {
//   const auth = req.headers.authorization || req.get('Authentication') || '';
//   if (!auth) return null;
//   // support: "Bearer <token>" or raw token in Authentication header
//   if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
//   return auth.trim();
// };
/**
 * Middleware to authenticate requests using JWT.
 * @param {*} req The request object.
 * @param {*} res The response object.
 * @param {*} next The next middleware function.
 * @returns 
 */
// const authenticate = (req, res, next) => {
//   try {
//     const token = getTokenFromHeader(req);
//     if (!token) return res.status(401).json({ error: 'Missing token' });
//     const payload = auth.verify(token); // auth from import
//     req.user = payload;
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: err.message || 'Invalid token' });
//   }
// };
export { hash, compare, signToken, verifyToken, };