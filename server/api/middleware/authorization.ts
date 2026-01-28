import type { Request, Response, NextFunction } from 'express';
import type { Document } from 'mongoose';
import { verifyToken } from '../utils/auth.js';
import User, { type IUser } from '../models/User.js';

declare global {
    namespace Express {
        interface Request {
            user?: IUser & Document;
        }
    }
}

type JwtPayload = { id?: string } & Record<string, unknown>;

const verifyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { authorization } = req.headers;

    try {
        if (!authorization) {
            res.status(401).json({ error: 'Unauthorized: no token provided' });
            return;
        }

        const [tokenType, token] = authorization.split(' ');

        if (tokenType !== 'Bearer' || !token) {
            res.status(401).json({ error: 'Unauthorized: invalid token format' });
            return;
        }

        const verified = verifyToken(token) as JwtPayload | null;
        if (!verified || typeof verified.id !== 'string') {
            res.status(401).json({ error: 'Unauthorized: token is invalid or expired' });
            return;
        }

        const user = await User.findById(verified.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        req.user = user as IUser & Document;

        // pass control to the next middleware or to route handler
        next();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: message });
    }
};

export { verifyUser };
