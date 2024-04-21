import { Response } from 'express';
import { AuthenticatedRequest } from "../interfaces";
import { NextFunction } from "express";
import prisma from "../config/prisma";

export const restaurantExists = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { restaurantId } = req.params;

    if (!restaurantId) {
        return res.status(400).json({
            error: {
                message: 'Restaurant ID not specified'
            }
        });
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: {
            id: restaurantId
        }
    });

    if (!restaurant) {
        return res.status(404).json({
            error: {
                message: `Could not find Restaurant with ID: ${restaurantId}`
            }
        });
    }

    return next();
};
