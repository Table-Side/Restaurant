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

router.get("/mine", async (req: AuthenticatedRequest, res: Response) => {
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

router.put('/:restaurantId/update', async (req: AuthenticatedRequest, res: Response) => {
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

    // Ensure user is owner of restaurant
    const restaurantId = req.params.restaurantId;
    const userId = req.user.sub;
    const restaurant = await prisma.restaurant.findUnique({
        where: {
            id: restaurantId
        },
        include: {
            restaurantOwners: true
        }
    });

    if (!restaurant) {
        res.status(404).json({
            error: {
                message: "Restaurant not found"
            }
        });
        return;
    }

    const isOwner = restaurant.restaurantOwners.some(owner => owner.userId === userId);
    if (!isOwner) {
        res.status(403).json({
            error: {
                message: "Forbidden",
                details: "User is not the owner of the restaurant"
            }
        });
        return;
    }

    // Update restaurant
    try {
        const { name, description } = req.body;

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

router.post('/:restaurantId/menu/new', async (req: AuthenticatedRequest, res: Response) => {
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

    // Ensure user is owner of restaurant
    const restaurantId = req.params.restaurantId;
    const userId = req.user.sub;
    const restaurant = await prisma.restaurant.findUnique({
        where: {
            id: restaurantId
        },
        include: {
            restaurantOwners: true
        }
    });

    if (!restaurant) {
        res.status(404).json({
            error: {
                message: "Restaurant not found"
            }
        });
        return;
    }

    const isOwner = restaurant.restaurantOwners.some(owner => owner.userId === userId);
    if (!isOwner) {
        res.status(403).json({
            error: {
                message: "Forbidden",
                details: "User is not the owner of the restaurant"
            }
        });
        return;
    }

    // Create new menu
    try {
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

router.put('/:restaurantId/menu/update', async (req: AuthenticatedRequest, res: Response) => {
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

    // Ensure user is owner of restaurant
    const restaurantId = req.params.restaurantId;
    const userId = req.user.sub;
    const restaurant = await prisma.restaurant.findUnique({
        where: {
            id: restaurantId
        },
        include: {
            restaurantOwners: true
        }
    });

    if (!restaurant) {
        res.status(404).json({
            error: {
                message: "Restaurant not found"
            }
        });
        return;
    }

    const isOwner = restaurant.restaurantOwners.some(owner => owner.userId === userId);
    if (!isOwner) {
        res.status(403).json({
            error: {
                message: "Forbidden",
                details: "User is not the owner of the restaurant"
            }
        });
        return;
    }

    // Create new menu
    try {
        const { name, start, end } = req.body;

        const menu = await prisma.menu.create({
            data: {
                name,
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

router.post('/:restaurantId/menu/:menuId/add', async (req: AuthenticatedRequest, res: Response) => {
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

    // Ensure user is owner of restaurant
    const { restaurantId, menuId } = req.params;
    const userId = req.user.sub;
    const restaurant = await prisma.restaurant.findUnique({
        where: {
            id: restaurantId
        },
        include: {
            restaurantOwners: true
        }
    });

    if (!restaurant) {
        res.status(404).json({
            error: {
                message: "Restaurant not found"
            }
        });
        return;
    }

    const isOwner = restaurant.restaurantOwners.some(owner => owner.userId === userId);
    if (!isOwner) {
        res.status(403).json({
            error: {
                message: "Forbidden",
                details: "User is not the owner of the restaurant"
            }
        });
        return;
    }

    // Add item to restaurant's menu
    try {
        const { displayName, shortName, description, price } = req.body;

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

router.put('/:restaurantId/menu/:menuId/:itemId/update', async (req: AuthenticatedRequest, res: Response) => {
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

    // Ensure user is owner of restaurant
    const restaurantId = req.params.restaurantId;
    const userId = req.user.sub;
    const restaurant = await prisma.restaurant.findUnique({
        where: {
            id: restaurantId
        },
        include: {
            restaurantOwners: true
        }
    });

    if (!restaurant) {
        res.status(404).json({
            error: {
                message: "Restaurant not found"
            }
        });
        return;
    }

    const isOwner = restaurant.restaurantOwners.some(owner => owner.userId === userId);
    if (!isOwner) {
        res.status(403).json({
            error: {
                message: "Forbidden",
                details: "User is not the owner of the restaurant"
            }
        });
        return;
    }

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

router.put('/:restaurantId/menu/:menuId/:itemId/update/availability/:availabilityState', async (req: AuthenticatedRequest, res: Response) => {
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

    // Ensure user is owner of restaurant
    const restaurantId = req.params.restaurantId;
    const userId = req.user.sub;
    const restaurant = await prisma.restaurant.findUnique({
        where: {
            id: restaurantId
        },
        include: {
            restaurantOwners: true
        }
    });

    if (!restaurant) {
        res.status(404).json({
            error: {
                message: "Restaurant not found"
            }
        });
        return;
    }

    const isOwner = restaurant.restaurantOwners.some(owner => owner.userId === userId);
    if (!isOwner) {
        res.status(403).json({
            error: {
                message: "Forbidden",
                details: "User is not the owner of the restaurant"
            }
        });
        return;
    }

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

router.delete('/:restaurantId/menu/:menuId/:itemId/remove', async (req: AuthenticatedRequest, res: Response) => {
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