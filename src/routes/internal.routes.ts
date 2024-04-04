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
})

router.get("/items", async (req: Request, res: Response) => {
    const { itemIds } = req.body;

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
            id: itemIds
        }
    });

    return res.status(items ? 200 : 404).json({
        data: items ? items : []
    });
})

export default router;