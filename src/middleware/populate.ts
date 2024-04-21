import { Response } from 'express';
import { NextFunction } from "express-serve-static-core";
import { AuthenticatedRequest } from "../interfaces";
import prisma from "../config/prisma";
import { Prisma } from '@prisma/client';

type MenuWithRestaurant = Prisma.MenuGetPayload<{
    include: { restaurant: true }
}>;

/**
 * Populates the menu and restaurant from an item.
 */
export const populateFromItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const itemId = req.params.itemId;

    if (!itemId) {
        return res.status(400).json({
            error: {
                message: 'Item ID not specified'
            }
        });
    }

    const item = await prisma.item.findUnique({
        where: {
            id: itemId
        },
        include: {
            menu: {
                include: {
                    restaurant: true
                }
            }
        }
    });

    if (!item) {
        res.status(404).json({
            error: {
                message: `Could not find Item with ID: ${itemId}`
            }
        });
    }

    if (!item.menu) {
        res.status(404).json({
            error: {
                message: `Could not find Menu for Item with ID: ${itemId}`
            }
        });
    }

    req.params.menuId = item.menu.id;
    res.locals.menu = item.menu;
    return populateFromMenu(req, res, next);
}

/**
 * Populates the restaurant from a menu.
 */
export const populateFromMenu = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const menuId = req.params.menuId;

    if (!menuId) {
        return res.status(400).json({
            error: {
                message: 'Menu ID not specified'
            }
        });
    }

    let menu: MenuWithRestaurant;

    if (res.locals.menu) {
        if (menuId != res.locals.menu.id) {
            return res.status(400).json({
                error: {
                    message: 'Conflict whilst processing requested Menu'
                }
            });
        }

        menu = res.locals.menu;
    } else {
        menu = await prisma.menu.findUnique({
            where: {
                id: menuId
            },
            include: {
                restaurant: true
            }
        });
    
        if (!menu) {
            return res.status(404).json({
                error: {
                    message: `Could not find Menu with ID: ${menuId}`
                }
            });
        }
    }

    if (!menu) {
        res.status(404).json({
            error: {
                message: `Could not find Menu with ID: ${menuId}`
            }
        });
    }

    console.log(menu);

    if (!menu.restaurant) {
        return res.status(404).json({
            error: {
                message: `Could not find Restaurant for Menu with ID: ${menuId}`
            }
        });
    }

    req.params.restaurantId = menu.restaurant.id;
    res.locals.restaurant = menu.restaurant;
    next();
}

