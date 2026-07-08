import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.routes";
import config from "./config";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { propertyRoutes } from "./modules/properties/property.routes";


const app : Application = express();

    app.use(cors({
        origin : config.app_url,
        credentials : true,
    }))

    app.use(express.json());
    app.use(express.urlencoded({ extended : true }));
    app.use(cookieParser())


    app.get("/",(req : Request, res : Response) => {
        res.send("Rent-nest API is running!");
   });

    app.use("/api/auth", authRoutes)
    app.use("/api/properties", propertyRoutes)

    
    app.use(notFound);

    app.use(globalErrorHandler)

export default app