import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { propertyController } from "./property.controller";
import { auth } from "../../middlewares/auth";


const router = Router();

router.post("/", auth(Role.LANDLORD,Role.ADMIN), propertyController.createProperty)

router.get("/", auth(Role.LANDLORD,Role.ADMIN),propertyController.getAllProperties)

router.get("/:id", auth(Role.LANDLORD,Role.ADMIN),propertyController.getPropertyById)

router.patch("/:id", auth(Role.LANDLORD,Role.ADMIN),propertyController.updateProperty)

router.delete("/:id", auth(Role.LANDLORD,Role.ADMIN),propertyController.deleteProperty)

export const propertyRoutes = router