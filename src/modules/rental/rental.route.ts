import { Router } from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";


const router = Router();

router.post("/:id", auth(Role.TENANT),rentalController.createRentalRequest);

// rentalRequest.route.ts
router.get("/my-requests", auth(Role.TENANT), rentalController.getMyRentalRequests)
router.get("/received", auth(Role.LANDLORD), rentalController.getReceivedRentalRequests)


export const rentalRoutes = router