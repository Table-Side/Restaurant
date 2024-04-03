import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../interfaces";

const router = Router();

router.get("/all", async (req: Request, res: Response) => {
    // Get all restaurants
    try {
        const restaurants = await prisma.restaurant.findMany();

        res.status(200).json({
            data: restaurants
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to get restaurants" });
    }
});

router.get("/own", async (req: AuthenticatedRequest, res: Response) => {
    // Safely unwrap user object
    if (!req.user) {
        res.status(401).json({
            error: {
                message: "Unauthorized",
                details: "JWT supplied is missing user information"
            }
        });
        return;
    }

    // Get user's own restaurants
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

router.post('/create', async (req: AuthenticatedRequest, res: Response) => {
    // Safely unwrap user object
    if (!req.user) {
        res.status(401).json({
            error: {
                message: "Unauthorized",
                details: "JWT supplied is missing user information"
            }
        });
        return;
    }

    // Create a new restaurant
    try {
        const userId = req.user!.sub;
        const { name, description } = req.body;

        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                description,
                restaurantOwners: {
                    create: {
                        userId
                    }
                }
            }
        });

        res.status(200).json({
            data: restaurant
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to create restaurant",
                details: error
            }
        });
    }
});

router.get('/:restaurantId/details', async (req: Request, res: Response) => {
    // Get restaurant by ID
    try {
        const { restaurantId } = req.params;
        const restaurant = await prisma.restaurant.findUnique({
            where: {
                id: restaurantId
            }
        });
        if (restaurant) {
            res.status(200).json({
                data: restaurant
            });
        } else {
            res.status(404).json({
                error: {
                    message: "Restaurant not found"
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            error: { 
                message: "Failed to get restaurant",
                details: error
            }
        });
    }
});

router.put('/:restaurantId/details', async (req: AuthenticatedRequest, res: Response) => {
    // Safely unwrap user object
    if (!req.user) {
        res.status(401).json({
            error: {
                message: "Unauthorized",
                details: "JWT supplied is missing user information"
            }
        });
        return;
    }

    // Ensure user has correct role (restaurant)
    if (!req.user.realm_access.roles.includes("restaurant")) {
        res.status(403).json({
            error: {
                message: "Forbidden",
                details: "User does not have the correct role to perform this action"
            }
        });
        return;
    }

    // TODO: Update restaurant
    
});

router.get('/:restaurantId/menu', async (req: Request, res: Response) => {
    // Get restaurant's menu
    try {
        const { restaurantId } = req.params;
        const menu = await prisma.menu.findMany({
            where: {
                restaurantId
            }
        });

        res.status(200).json({
            data: menu
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: `Failed to get menu`,
                details: error
            }
        });
    }
});

router.post('/:restaurantId/menu/add', async (req: AuthenticatedRequest, res: Response) => {
    // Safely unwrap user object
    if (!req.user) {
        res.status(401).json({
            error: {
                message: "Unauthorized",
                details: "JWT supplied is missing user information"
            }
        });
        return;
    }

    // Ensure user has correct role (restaurant)
    if (!req.user.realm_access.roles.includes("restaurant")) {
        res.status(403).json({
            error: {
                message: "Forbidden",
                details: "User does not have the correct role to perform this action"
            }
        });
        return;
    }

    // Add item to restaurant's menu
    try {
        const { displayName, shortName, description, quantity, price, menuId } = req.body;

        const item = await prisma.item.create({
            data: {
                displayName,
                shortName,
                description,
                quantity,
                price,
                menuId,
            }
        });

        const menu = await prisma.menu.findUnique({
            where: {
                id: menuId
            }
        });

        res.status(200).json({
            data: menu
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to add item to menu",
                details: error
            }
        });
    }
});

router.put('/:restaurantId/menu/:itemId', async (req: AuthenticatedRequest, res: Response) => {
    // Safely unwrap user object
    if (!req.user) {
        res.status(401).json({
            error: {
                message: "Unauthorized",
                details: "JWT supplied is missing user information"
            }
        });
        return;
    }

    // Ensure user has correct role (restaurant)
    if (!req.user.realm_access.roles.includes("restaurant")) {
        res.status(403).json({
            error: {
                message: "Forbidden",
                details: "User does not have the correct role to perform this action"
            }
        });
        return;
    }

    // TODO: Update menu item
});

router.put('/:restaurantId/menu/:itemId/update-availability/:availabilityState', async (req: AuthenticatedRequest, res: Response) => {
    // Safely unwrap user object
    if (!req.user) {
        res.status(401).json({
            error: {
                message: "Unauthorized",
                details: "JWT supplied is missing user information"
            }
        });
        return;
    }

    // Ensure user has correct role (restaurant)
    if (!req.user.realm_access.roles.includes("restaurant")) {
        res.status(403).json({
            error: {
                message: "Forbidden",
                details: "User does not have the correct role to perform this action"
            }
        });
        return;
    }

    // Update menu item availability
    try {
        const { itemId, availabilityState } = req.params;

        const item = await prisma.item.update({
            where: {
                id: itemId
            },
            data: {
                isAvailable: availabilityState === "true"
            }
        });

        res.status(200).json({
            data: item
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to update item availability",
                details: error
            }
        });
    }
});

router.delete('/:restaurantId/menu/:itemId', async (req: AuthenticatedRequest, res: Response) => {
    // Safely unwrap user object
    if (!req.user) {
        res.status(401).json({
            error: {
                message: "Unauthorized",
                details: "JWT supplied is missing user information"
            }
        });
        return;
    }

    // Ensure user has correct role (restaurant)
    if (!req.user.realm_access.roles.includes("restaurant")) {
        res.status(403).json({
            error: {
                message: "Forbidden",
                details: "User does not have the correct role to perform this action"
            }
        });
        return;
    }
    
    // Delete menu item
    try {
        const { itemId } = req.params;

        await prisma.item.delete({
            where: {
                id: itemId
            }
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to delete item",
                details: error
            }
        });
    }
});

export default router;
