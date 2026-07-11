import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.routes.js";
import config from "./config/index.js";
import { notFound } from "./middlewares/notFound.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { propertyRoutes } from "./modules/properties/property.routes.js";
import { rentalRoutes } from "./modules/rental/rental.route.js";
import { reviewRoutes } from "./modules/review/review.route.js";
import { userRoutes } from "./modules/user/user.route.js";
import { paymentRoutes } from "./modules/payment/payment.route.js";
import { paymentController } from "./modules/payment/payment.controller.js";
import { categoryRoutes } from "./modules/category/category.route.js";
import { startExpiredRentalJob } from "./jobs/completeExpiredRentals.js";


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
    app.use("/api/categories", categoryRoutes)
    app.use("/api/properties", propertyRoutes)
    app.use("/api/rentals", rentalRoutes)
    app.use("/api/reviews", reviewRoutes)
    app.use("/api/payment", paymentRoutes)



    startExpiredRentalJob()

    app.use(notFound);

    app.use(globalErrorHandler)

export default app