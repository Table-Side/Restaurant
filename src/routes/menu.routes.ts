import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../interfaces";
import { ownsRestaurant, populateFromMenu, restaurantExists } from "../middleware";

const router = Router({ mergeParams: true });

router.get('/', restaurantExists, async (req: Request, res: Response) => {
    // Get all menus for a given restaurant.
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

router.get('/:menuId', populateFromMenu, async (req: Request, res: Response) => {
    // Get specific restaurant menu
    try {
        const { restaurantId, menuId } = req.params;
        const menu = await prisma.menu.findFirstOrThrow({
            where: {
                id: menuId,
                restaurantId,
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
                message: `Failed to get menu`,
                details: error
            }
        });
    }
});

router.put('/', ...ownsRestaurant, async (req: AuthenticatedRequest, res: Response) => {
    // Create new menu
    try {
        const { restaurantId } = req.params;
        const { name } = req.body;

        const menu = await prisma.menu.create({
            data: {
                name,
                restaurantId,
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
});

router.patch('/:menuId', populateFromMenu, ...ownsRestaurant, async (req: AuthenticatedRequest, res: Response) => {
    // Update a menu
    try {
        const { menuId } = req.params
        const { name } = req.body;

        const updatedMenu = await prisma.menu.update({
            where: {
                id: menuId
            },
            data: {
                name
            }
        });
        res.status(200).json({
            data: updatedMenu
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to update menu",
                details: error
            }
        });
    }
});

router.delete('/:menuId', populateFromMenu, ...ownsRestaurant, async (req: AuthenticatedRequest, res: Response) => {
    // Delete a menu
    try {
        const { menuId } = req.params

        await prisma.menu.delete({
            where: {
                id: menuId
            }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to delete menu",
                details: error
            }
        });
    }
});

export default router;
