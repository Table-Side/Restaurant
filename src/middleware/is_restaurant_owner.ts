import { Response, RequestHandler, NextFunction } from 'express';
import { AuthenticatedRequest } from '../interfaces';
import prisma from "../config/prisma";
import hasRole from './has_role';
import { restaurantExists } from './exists';

/**
 * Checks if the current user owns the restaurant.
 * 
 * First, checks that the user is authenticated, and then whether the user has a role.
 */
export const ownsRestaurant: RequestHandler[] = [
    restaurantExists,
    ...hasRole("restaurant"),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const restaurantId = req.params.restaurantId;
        const userId = req.user.sub;
        
        try {
            const restaurant = await prisma.restaurant.findUnique({
                where: {
                    id: restaurantId
                },
                include: {
                    restaurantOwners: true
                }
            })!;
        
            const isOwner = restaurant.restaurantOwners.some(owner => owner.userId === userId);
            if (!isOwner) {
                return res.status(403).json({
                    error: {
                        message: "Forbidden",
                        details: "User is not the owner of the restaurant"
                    }
                });
            }

            next();
        } catch (ex) {
            return res.status(500).json({
                error: {
                    message: "Internal Server Error",
                    details: ex.message,
                }
            })
        }
    }
];
