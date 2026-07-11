import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";
import ValidateRequest from "../../middlewares/validateRequest";
import { paymentValidation } from "./payment.validation";



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