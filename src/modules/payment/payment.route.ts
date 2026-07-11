import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { paymentController } from "./payment.controller.js";
import ValidateRequest from "../../middlewares/validateRequest.js";
import { paymentValidation } from "./payment.validation.js";



const router = Router();

router.post("/checkout-session", 
    auth(Role.TENANT),
    ValidateRequest(paymentValidation.createCheckoutSession),
    paymentController.createCheckoutSession
)

router.get(
    "/",
    auth(Role.TENANT),
    ValidateRequest(paymentValidation.getPaymentHistory),
    paymentController.getMyPaymentHistory
);


export const paymentRoutes = router