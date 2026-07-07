import { Router } from "express";
import { authController } from "../auth/auth.controller";
import { validateRegisterRole } from "../../middlewares/validateRegisterRole";

const router = Router();

router.post("/register",validateRegisterRole, authController.registerUser )


export const authRoutes = router;