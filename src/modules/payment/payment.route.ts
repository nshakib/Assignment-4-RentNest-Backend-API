import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";



const router = Router();

router.post("/checkout-session", auth(Role.TENANT), paymentController.createCheckoutSession)
router.get("/my-history", auth(Role.TENANT), paymentController.getMyPaymentHistory)


export const paymentRoutes = router