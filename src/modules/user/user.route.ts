import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { userController } from "./user.controller";

const router = Router();

router.get("/me", auth(), userController.getMyProfile)
router.patch("/me", auth(), userController.updateMyProfile)
router.patch("/change-password", auth(), userController.changePassword)

router.get("/", auth(Role.ADMIN), userController.getAllUsers)
router.patch("/:id/status", auth(Role.ADMIN), userController.updateUserStatus)



export const userRoutes = router;