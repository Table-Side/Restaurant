import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../interfaces";
import { hasRole, isAuthenticated } from "../middleware";

const router = Router();

router.get("/mine", isAuthenticated, hasRole('restaurant'), async (req: AuthenticatedRequest, res: Response) => {
    // Get user's restaurants
    try {
        const userId = req.user.sub;

        const restaurants = await prisma.restaurant.findMany({
            where: {
                restaurantOwners: {
                    some: {
                        userId: userId
                    }
                }
            }
        });

        res.status(200).json({
            data: restaurants
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to get restaurants",
                details: error
            }
        });
    }
});

export default router;
