import { Router, Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../interfaces";
import { ownsRestaurant, populateFromItem, populateFromMenu } from "../middleware";

const router = Router({ mergeParams: true });

router.get('/', populateFromMenu, ...ownsRestaurant, async (req: AuthenticatedRequest, res: Response) => {
    // Get all items from restaurant's menu
    try {
        const { menuId } = req.params;

        const menu = await prisma.menu.findUnique({
            where: {
                id: menuId
            },
            include: {
                items: true
            }
        });

        res.status(200).json({
            data: menu.items
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to get menu items",
                details: error
            }
        });
    }
});

router.put('/', populateFromMenu, ...ownsRestaurant, async (req: AuthenticatedRequest, res: Response) => {
    // Add item to restaurant's menu
    try {
        const { menuId } = req.params;
        const { displayName, shortName, description, price } = req.body;

        const item = await prisma.item.create({
            data: {
                menuId,
                displayName,
                shortName,
                description,
                price,
            }
        });

        if (!item) {
            res.status(500).json({
                error: {
                    message: "Failed to add item to menu"
                }
            });
        }

        const menu = await prisma.menu.findUnique({
            where: {
                id: menuId
            },
            include: {
                items: true
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

router.patch('/:itemId', populateFromItem, ...ownsRestaurant, async (req: AuthenticatedRequest, res: Response) => {
    // Update menu item
    try {
        const { itemId } = req.params;
        const { displayName, shortName, description, price } = req.body;

        const item = await prisma.item.update({
            where: {
                id: itemId
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

router.patch('/:itemId/availability', populateFromItem, ...ownsRestaurant, async (req: AuthenticatedRequest, res: Response) => {
    // Update menu item availability
    try {
        const { itemId } = req.params;
        const { isAvailable } = req.body;

        const item = await prisma.item.update({
            where: {                
                id: itemId
            },
            data: {
                isAvailable: isAvailable === true
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

router.delete('/:itemId', populateFromItem, ...ownsRestaurant, async (req: AuthenticatedRequest, res: Response) => {
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