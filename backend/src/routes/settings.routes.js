import { Router } from "express";
import { getAll, update } from "../controllers/settings.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getAll);
router.put("/", authMiddleware, update);

export default router;
