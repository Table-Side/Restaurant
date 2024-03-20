import { Router, Request } from "express";
import prisma from "../config/prisma";

const router = Router();

router.get("/all", async (req, res) => {
    // Get all restaurants
    try {
        const restaurants = await prisma.restaurant.findMany();

        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ error: "Failed to get restaurants" });
    }
});

router.get("/own", async (req, res) => {
    // Get user's own restaurants
    try {
        const { userId } = req.user as { userId: string };

        const restaurants = await prisma.restaurant.findMany({
            where: {
                restaurantOwners: {
                    some: {
                        userId: userId
                    }
                }
            }
        });

        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ error: "Failed to get restaurants" });
    }
});

router.post('/create', async (req, res) => {
    // Create a new restaurant
    try {
        const { userId } = req.user as { userId: string };
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

        res.status(201).json(restaurant);
    } catch (error) {
        res.status(500).json({ error: "Failed to create restaurant" });
    }
});

router.get('/:restaurantId/details', async (req, res) => {
    // Get restaurant by ID
    try {
        const { restaurantId } = req.params;
        const restaurant = await prisma.restaurant.findUnique({
            where: {
                id: restaurantId
            }
        });
        if (restaurant) {
            res.status(200).json(restaurant);
        } else {
            res.status(404).json({ error: "Restaurant not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to get restaurant" });
    }
});

router.put('/:restaurantId/details', async (req, res) => {
    // TODO: Update restaurant
    
});

router.get('/:restaurantId/menu', async (req, res) => {
    // Get restaurant's menu
    try {
        const { restaurantId } = req.params;
        const menu = await prisma.menu.findMany({
            where: {
                restaurantId
            }
        });

        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ error: "Failed to get menu" });
    }
});

router.post('/:restaurantId/menu/add', async (req, res) => {
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

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to add item to menu" });
    }
});

router.put('/:restaurantId/menu/:itemId', async (req, res) => {
    // TODO: Update menu item
});

router.put('/:restaurantId/menu/:itemId/update-availability/:availabilityState', async (req, res) => {
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

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to update item availability" });
    }
});

router.delete('/:restaurantId/menu/:itemId', async (req, res) => {
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
        res.status(500).json({ error: "Failed to delete item" });
    }
});

export default router;
