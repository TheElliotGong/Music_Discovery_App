import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // optional: throw here so missing secret is detected at startup
  console.warn('Warning: JWT_SECRET is not set. Tokens will not be secure.');
}

const hash = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const compare = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const sign = (payload, opts = {}) => {
  if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');
  const options = { algorithm: 'HS256', expiresIn: '24h', ...opts };
  return jwt.sign(payload, JWT_SECRET, options);
};

const verify = (token) => {
  if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');
  // specify allowed algorithms explicitly
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
};
const getTokenFromHeader = (req) => {
  const auth = req.headers.authorization || req.get('Authentication') || '';
  if (!auth) return null;
  // support: "Bearer <token>" or raw token in Authentication header
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return auth.trim();
};

const authenticate = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const payload = auth.verify(token); // auth from import
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message || 'Invalid token' });
  }
};
export default { hash, compare, sign, verify, getTokenFromHeader, authenticate };