import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { userController } from "./user.controller";

const router = Router();

router.get("/me", auth(Role.ADMIN,Role.LANDLORD,Role.TENANT), userController.getMyProfile)

router.patch("/me", auth(Role.ADMIN,Role.LANDLORD,Role.TENANT), userController.updateMyProfile)



export const userRoutes = router;