import { Router } from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import { reviewValidation } from "./review.validation";

const router = Router();

router.post(
    "/",
    auth(Role.TENANT),
    validateRequest(reviewValidation.createReviewValidation),
    reviewController.createReview
);

router.get("/received", auth(Role.LANDLORD), reviewController.getReceivedReviews);

export const reviewRoutes = router;