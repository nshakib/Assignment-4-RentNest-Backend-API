import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.routes";
import config from "./config";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { propertyRoutes } from "./modules/properties/property.routes";
import { rentalRoutes } from "./modules/rental/rental.route";
import { reviewRoutes } from "./modules/review/review.route";
import { userRoutes } from "./modules/user/user.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { paymentController } from "./modules/payment/payment.controller";


const app : Application = express();

    app.use(cors({
        origin : config.app_url,
        credentials : true,
    }))
    app.post("/api/payment/webhook",express.raw({
         type: "application/json" 
        }),
        paymentController.handleStripeWebhook
    )

    app.use(express.json());
    app.use(express.urlencoded({ extended : true }));
    app.use(cookieParser())


    app.get("/",(req : Request, res : Response) => {
        res.send("Rent-nest API is running!");
   });

    app.use("/api/auth", authRoutes)
    app.use("/api/users", userRoutes)
    app.use("/api/properties", propertyRoutes)
    app.use("/api/rentals", rentalRoutes)
    app.use("/api/reviews", reviewRoutes)
    app.use("/api/payment", paymentRoutes)


    
    app.use(notFound);

    app.use(globalErrorHandler)

export default app