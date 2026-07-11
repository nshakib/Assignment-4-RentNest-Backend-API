import { Router } from "express";
import { categoryController } from "./category.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import ValidateRequest from "../../middlewares/validateRequest";
import { categoryValidation } from "./category.validation";

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