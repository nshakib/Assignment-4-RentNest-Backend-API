import { Router } from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import ValidateRequest from "../../middlewares/validateRequest";
import { rentalRequestValidation } from "./rentalRequest.validation";


const router = Router();

router.post("/:id", auth(Role.TENANT),ValidateRequest(rentalRequestValidation.createRentalRequestValidation),rentalController.createRentalRequest);


router.get("/my-requests", auth(Role.TENANT), rentalController.getMyRentalRequests)
router.get("/received", auth(Role.LANDLORD), rentalController.getReceivedRentalRequests)

router.patch("/:id/approve", auth(Role.LANDLORD), rentalController.approveRentalRequest)

router.patch(
    "/:id/reject",
    auth(Role.LANDLORD),
    ValidateRequest(rentalRequestValidation.rejectRentalRequestValidation),
    rentalController.rejectRentalRequest
)

router.get("/admin/all", auth(Role.ADMIN), rentalController.getAllRentalRequestsForAdmin)

export const rentalRoutes = router