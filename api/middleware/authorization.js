import { verify } from '../util/auth.js';
import { User } from '../../db/mocks.js';

const verifyUser = async (req, res, next) => {
    try {
        //Check for Authorization header
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
        }
        //Extract token from header
        const [token_type, token] = authorization.split(' ');
        //Validate the token and its type
        if (token_type !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Authorization header format' });
        }
        // verify token and decode payload
        //decoded payload: {username, _id}
        const verified = verify(token);
        if (!verified || !verified.id) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
        }
        // get user from database using decoded _id
        const user = User.find('_id', verified.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // attach user to request object for downstream handlers
        req.user = user;
        //pass control to next middleware or route handler
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to authorize user' });
    }

};

export { verifyUser };
