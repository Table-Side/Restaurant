import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../interfaces";
import { hasRole, isAuthenticated, isRestaurantOwner } from "../middleware";

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

router.get("/mine", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
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

router.post('/create', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    // Create a new restaurant
    try {
        const userId = req.user!.sub;
        const { name, description, numberOfTables } = req.body;

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

        // Create tables for the restaurant
        for (let i = 1; i <= numberOfTables; i++) {
            await prisma.restaurantTable.create({
                data: {
                    Restaurant: {
                        connect: {
                            id: restaurant.id
                        }
                    },
                    number: i
                }
            });
        }

        // TODO: Update user role to restaurant owner (fix URL)
        // await fetch(`${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify([
        //         {
        //             name: "restaurant"
        //         }
        //     ])
        // }).then(res => res.json()).then(
            
        // );

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

router.put('/:restaurantId/update', isAuthenticated, hasRole("restaurant"), isRestaurantOwner, async (req: AuthenticatedRequest, res: Response) => {
    // Update restaurant
    try {
        const { name, description } = req.body;
        const { restaurantId } = req.params;

        const updatedRestaurant = await prisma.restaurant.update({
            where: {
                id: restaurantId
            },
            data: {
                name,
                description
            }
        });

        res.status(200).json({
            data: updatedRestaurant
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to update restaurant",
                details: error
            }
        });
    }
});

router.get('/:restaurantId/menu/all', async (req: Request, res: Response) => {
    // Get all restaurant's menu
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

router.post('/:restaurantId/menu/new', isAuthenticated, hasRole("restaurant"), isRestaurantOwner, async (req: AuthenticatedRequest, res: Response) => {
    // Create new menu
    try {
        const { restaurantId } = req.params;
        const { name, start, end } = req.body;

        const menu = await prisma.menu.create({
            data: {
                name,
                restaurantId,
                startTime: start,
                endTime: end
            }
        });

        res.status(200).json({
            data: menu
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to create menu",
                details: error
            }
        });
    }
})

router.put('/:restaurantId/menu/:menuId/update', isAuthenticated, hasRole("restaurant"), isRestaurantOwner, async (req: AuthenticatedRequest, res: Response) => {
    // Create new menu
    try {
        const { menuId } = req.params
        const { name, start, end } = req.body;

        const updatedMenu = await prisma.menu.update({
            where: {
                id: menuId
            },
            data: {
                name,
                startTime: start,
                endTime: end
            }
        });
        res.status(200).json({
            data: updatedMenu
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to create menu",
                details: error
            }
        });
    }
})

router.get('/:restaurantId/menu/:menuId/details', async (req: Request, res: Response) => {
    // Get restaurant's menu
    try {
        const { restaurantId, menuId } = req.params;
        const menu = await prisma.menu.findFirstOrThrow({
            where: {
                id: menuId,
                restaurantId,
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

router.post('/:restaurantId/menu/:menuId/add', isAuthenticated, hasRole("restaurant"), isRestaurantOwner, async (req: AuthenticatedRequest, res: Response) => {
    // Add item to restaurant's menu
    try {
        const { displayName, shortName, description, price } = req.body;
        const { menuId } = req.params;

        const item = await prisma.item.create({
            data: {
                displayName,
                shortName,
                description,
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

router.put('/:restaurantId/menu/:menuId/:itemId/update', isAuthenticated, hasRole("restaurant"), isRestaurantOwner, async (req: AuthenticatedRequest, res: Response) => {
    // Update menu item
    try {
        const { itemId, menuId } = req.params;
        const { displayName, shortName, description, price } = req.body;

        const item = await prisma.item.update({
            where: {
                id: itemId,
                menuId: menuId
            },
            data: {
                displayName,
                shortName,
                description,
                price
            }
        });

        res.status(200).json({
            data: item
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to update item",
                details: error
            }
        });
    }
});

router.put('/:restaurantId/menu/:menuId/:itemId/update/availability/:availabilityState', isAuthenticated, hasRole("restaurant"), isRestaurantOwner, async (req: AuthenticatedRequest, res: Response) => {
    // Update menu item availability
    try {
        const { itemId, menuId, availabilityState } = req.params;

        const item = await prisma.item.update({
            where: {
                menuId: menuId,
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

router.delete('/:restaurantId/menu/:menuId/:itemId/remove', isAuthenticated, hasRole("restaurant"), isRestaurantOwner, async (req: AuthenticatedRequest, res: Response) => {
    // Delete menu item
    try {
        const { itemId, menuId } = req.params;

        await prisma.item.delete({
            where: {
                id: itemId,
                menuId: menuId,
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