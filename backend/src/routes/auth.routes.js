import { Router } from "express";
import {
  login, verify2fa, resend2fa, checkEmail, me, changePassword, refresh, logout,
} from "../controllers/auth.controller.js";
import { authMiddleware, anyAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/verify-2fa", verify2fa);
router.post("/resend-2fa", resend2fa);
router.post("/check-email", checkEmail);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", anyAuth, me);
router.put("/change-password", authMiddleware, changePassword);

export default router;
