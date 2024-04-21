import express, { NextFunction, Request, Response } from 'express';

import * as middleware from "./middleware";

import * as routers from "./routes";

class App {
    public server;

    constructor() {
        this.server = express();

        this.middlewares();
        this.routes();
    }

    middlewares() {
        // JSON
        this.server.use(express.json());

        // Error handling
        this.server.use((err: any, req: Request, res: Response, next: NextFunction) => {
            console.error(err.stack);
            res.status(500).send('Unknown error occurred!');
            next();
        });

        // Request Logging (console)
        this.server.use((req: Request, res: Response, next: NextFunction) => {
            console.log(`Request received: ${req.method} ${req.url}`);
            next();
        });
        
        // JWT Decode
        this.server.use(middleware.decodeJWT);
    }

    routes() {
        // User-specific routes
        this.server.use("/restaurants", routers.user);

        // Restaurant routes
        this.server.use("/restaurants", routers.restaurant);
        this.server.use("/restaurants/:restaurantId/menus/", routers.menu);
        this.server.use("/restaurants/:restaurantId/menus/:menuId/items", routers.item);

        // Internal routes
        this.server.use("/internal", routers.internal);

        // 404
        this.server.use((req: Request, res: Response, next: NextFunction) => {
            return res.status(404).send({
                error: {
                    code: 404,
                    message: "Route Not Found",
                    uri: req.originalUrl,
                }
            });
        });
    }
}

export default new App().server;
