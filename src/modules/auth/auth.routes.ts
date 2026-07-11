import { Router } from "express";
import { authController } from "../auth/auth.controller";

import { validateRegisterRole } from "../../middlewares/validateRegisterRole";
import ValidateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";

const router = Router();

router.post("/register",
    ValidateRequest(authValidation.registerValidation),
    validateRegisterRole,
    authController.registerUser 
)

router.post("/login",
    ValidateRequest(authValidation.loginValidation),
    authController.loginUser)

router.post("/refresh-token",
    ValidateRequest(authValidation.refreshTokenValidation),
    authController.refreshToken)


export const authRoutes = router;