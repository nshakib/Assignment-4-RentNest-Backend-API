import { Router } from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";


const router = Router();

router.post("/:id", auth(Role.TENANT),rentalController.createRentalRequest)


export const rentalRoutes = router