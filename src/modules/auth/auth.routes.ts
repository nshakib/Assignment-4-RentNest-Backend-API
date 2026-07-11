import { Router } from "express";
import { authController } from "../auth/auth.controller.js";

import { validateRegisterRole } from "../../middlewares/validateRegisterRole.js";
import ValidateRequest from "../../middlewares/validateRequest.js";
import { authValidation } from "./auth.validation.js";

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