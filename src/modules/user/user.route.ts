import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { userController } from "./user.controller";

const router = Router();

router.get("/me", auth(Role.ADMIN), userController.getMyProfile)


export const userRoutes = router;