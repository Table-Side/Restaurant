import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../interfaces";
import { hasRole } from "../middleware";
import { ownsRestaurant } from "../middleware/is_restaurant_owner";

const router = Router({ mergeParams: true });

router.get("/", async (req: Request, res: Response) => {
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

router.get('/:restaurantId', async (req: Request, res: Response) => {
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

router.put('/', ...hasRole('restaurant'), async (req: AuthenticatedRequest, res: Response) => {
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

router.patch('/:restaurantId', ...ownsRestaurant, async (req: AuthenticatedRequest, res: Response) => {
    // Update restaurant
    try {
        const { restaurantId } = req.params;
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

router.delete('/:restaurantId', ...ownsRestaurant, async (req: AuthenticatedRequest, res: Response) => {
    // Update restaurant
    try {
        const { restaurantId } = req.params;

        await prisma.restaurant.delete({
            where: {
                id: restaurantId
            }
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Failed to update restaurant",
                details: error
            }
        });
    }
});

export default router;