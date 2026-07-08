import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { propertyController } from "./property.controller";
import { auth } from "../../middlewares/auth";


const router = Router();

router.post("/", auth(Role.LANDLORD,Role.ADMIN), propertyController.createProperty)

router.get("/", auth(Role.LANDLORD,Role.ADMIN),propertyController.getAllProperties)

export const propertyRoutes = router