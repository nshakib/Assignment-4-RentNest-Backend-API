import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import ValidateRequest from "../../middlewares/validateRequest.js";
import { categoryValidation } from "./category.validation.js";

const router = Router();

router.post(
    "/",
    auth(Role.ADMIN),
    ValidateRequest(categoryValidation.createCategoryValidation),
    categoryController.createCategory
)
router.get("/", categoryController.getAllCategories)

router.patch(
    "/:id",
    auth(Role.ADMIN),
    ValidateRequest(categoryValidation.updateCategoryValidation),
    categoryController.updateCategory
)

router.delete("/:id",auth(Role.ADMIN), categoryController.deleteCategory)


export const categoryRoutes = router