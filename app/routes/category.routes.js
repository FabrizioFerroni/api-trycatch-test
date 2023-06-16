import { verifyToken, isAdmin, isModerator, isModeratorOrAdmin } from "../middleware/authJwt.js";
import { Router } from "express";
import { getAll, getById, create } from "../controllers/category.controller.js"
import { createCategory } from "../validation/category.validation.js";
import multipart from "connect-multiparty";

const router = Router();
const path = multipart({ uploadDir: './uploads/category' })

router.get("/categories", verifyToken, getAll)
router.get("/categories/:id", verifyToken, getById)
router.post("/categories", path, createCategory, verifyToken, create)
router.put("/categories/:id/edit", path, verifyToken)
router.delete("/categories/:id/delete", verifyToken)


export default router;