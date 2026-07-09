import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { propertyController } from "./property.controller";
import { auth } from "../../middlewares/auth";


const router = Router();

router.post("/", auth(Role.LANDLORD,Role.ADMIN), propertyController.createProperty)

router.get("/my-properties", auth(Role.LANDLORD), propertyController.getMyProperties)

router.get("/",propertyController.getAllProperties);
router.get("/:id", propertyController.getPropertyById);


router.patch("/:id", auth(Role.LANDLORD,Role.ADMIN),propertyController.updateProperty)
router.delete("/:id", auth(Role.LANDLORD,Role.ADMIN),propertyController.deleteProperty)
router.patch("/:id/status", auth(Role.LANDLORD), propertyController.updatePropertyStatus)
router.get("/status/summary", auth(Role.LANDLORD), propertyController.getPropertyStatusSummary)

export const propertyRoutes = router