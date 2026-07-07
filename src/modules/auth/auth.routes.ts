import { Router } from "express";
import { authController } from "../auth/auth.controller";
import { validateRegisterRole } from "../../middlewares/validateRegisterRole";

const router = Router();

router.post("/register",validateRegisterRole, authController.registerUser )

router.post("/login", authController.loginUser)

router.post("/refresh-token", authController.refreshToken)


export const authRoutes = router;