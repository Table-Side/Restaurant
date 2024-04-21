import { Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from '../interfaces';
import isAuthenticated from './authenticated';

const hasRole = (role: string): RequestHandler[] => [
    isAuthenticated,
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user.realm_access.roles.includes(role)) {
            res.status(403).json({
                error: {
                    message: "Forbidden",
                    details: "User does not have the correct role to perform this action"
                }
            });
            return;
        }
        next();
    },
]

export default hasRole;