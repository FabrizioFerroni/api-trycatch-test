import { Router } from "express";
import { checkDuplicateEmail, checkRolesExisted } from "../middleware/verifySignUp.js";
import { register_user, login_user, recovery_pass, forgotPasswordVal } from '../validation/user.validation.js';
import { verifyToken } from "../middleware/authJwt.js";
import { register, login, refreshToken, verify, forgotPassword, resetPassword, reactiveUser } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", [
    checkDuplicateEmail,
    checkRolesExisted
], register_user, register);
router.post("/login", login_user, login);
router.post("/refresh", verifyToken, refreshToken);
router.get('/verify/:token', verify);
router.post('/forgot-password', forgotPasswordVal, forgotPassword)
router.post('/recovery-password/:token', recovery_pass, resetPassword);
router.post('/re-activate', forgotPasswordVal, reactiveUser)

export default router;