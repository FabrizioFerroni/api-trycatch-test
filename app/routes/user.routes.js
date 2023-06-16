import { verifyToken, isAdmin, isModerator, isModeratorOrAdmin } from "../middleware/authJwt.js";
import { Router } from "express";
import { allAccess, userBoard, moderatorBoard, adminBoard, adminandmodBoard } from "../controllers/user.controller.js";

const router = Router();

router.get("/test/all", allAccess);
router.get("/test/user", [verifyToken], userBoard);
router.get("/test/mod", [verifyToken, isModerator], moderatorBoard);
router.get("/test/admin", [verifyToken, isAdmin], adminBoard);
router.get("/test/adminandmod", [verifyToken, isModeratorOrAdmin], adminandmodBoard);

export default router;