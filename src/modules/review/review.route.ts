import { Router } from "express";
import { reviewController } from "./review.controller.js";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { reviewValidation } from "./review.validation.js";

const router = Router();

router.post(
    "/",
    auth(Role.TENANT),
    validateRequest(reviewValidation.createReviewValidation),
    reviewController.createReview
);

router.get("/received", auth(Role.LANDLORD), reviewController.getReceivedReviews);

export const reviewRoutes = router;