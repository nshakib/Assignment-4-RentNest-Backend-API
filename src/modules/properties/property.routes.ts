import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { propertyController } from "./property.controller.js";
import { auth } from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { propertyValidation } from "./property.validation.js";

const router = Router();

router.post(
    "/",
    auth(Role.LANDLORD),
    validateRequest(propertyValidation.createPropertyValidation),
    propertyController.createProperty
)

router.get("/my-properties", auth(Role.LANDLORD), propertyController.getMyProperties)

router.get("/", propertyController.getAllProperties);
router.get("/:id", propertyController.getPropertyById);

router.patch(
    "/:id",
    auth(Role.LANDLORD),
    validateRequest(propertyValidation.updatePropertyValidation),
    propertyController.updateProperty
)

router.delete("/:id", auth(Role.LANDLORD), propertyController.deleteProperty)

router.patch(
    "/:id/status",
    auth(Role.LANDLORD),
    validateRequest(propertyValidation.updatePropertyStatusValidation),
    propertyController.updatePropertyStatus
)

router.get("/status/summary", auth(Role.LANDLORD), propertyController.getPropertyStatusSummary)

router.get("/admin/all", auth(Role.ADMIN), propertyController.getAllPropertiesForAdmin)

export const propertyRoutes = router