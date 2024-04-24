import { Router, Request, Response } from "express";
import prisma from "../config/prisma";

const router = Router();

router.get("/restaurant/exists", async (req: Request, res: Response) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            error: {
                message: "Invalid request",
                details: "No restaurant ID provided"
            }
        });
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: {
            id: id.toString()
        }
    });

    return res.status(restaurant ? 200 : 404).json({
        data: {
            exists: restaurant ? true : false
        }
    });
});

router.get("/restaurant/:restaurantId/isOwner", async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({
            error: {
                message: "Invalid request",
                details: "No user ID provided"
            }
        });
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: {
            id: restaurantId
        },
        include: {
            restaurantOwners: true
        }
    });

    if (!restaurant) {
        return res.status(404).json({
            error: {
                message: "Restaurant not found",
                details: "No restaurant found with the provided ID"
            }
        });
    }

    const isOwner = restaurant.restaurantOwners.some(owner => owner.userId === userId.toString());

    return res.status(isOwner ? 200 : 403).json({ data: { isOwner: isOwner } });
});

router.post("/items", async (req: Request, res: Response) => {
    const { restaurantId, itemIds } = req.body;

    if (!itemIds) {
        return res.status(400).json({
            error: {
                message: "Invalid request",
                details: "No item IDs provided"
            }
        });
    }

    const items = await prisma.item.findMany({
        where: {
            id: {
                in: itemIds
            },
            menu: {
                restaurantId: restaurantId.toString()
            }
        }
    });

    if (!items) {
        return res.status(404).json({
            error: {
                message: "Items not found",
                details: "No items found with the provided IDs"
            }
        });
    }

    return res.status(200).json({
        data: items
    });
})

export default router;