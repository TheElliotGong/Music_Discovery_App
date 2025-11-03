import { verify } from '../util/auth.js';
import { User } from '../../db/mocks.js';

const verifyUser = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
        }
        const [token_type, token] = authorization.split(' ');
        
        if (token_type !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Authorization header format' });
        }
        const verified = verify(token);
        if (!verified || !verified.id) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
        }
        const user = User.find('_id', verified.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to authorize user' });
    }

};

export {verifyUser};
