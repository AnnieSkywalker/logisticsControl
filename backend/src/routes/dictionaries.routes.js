import { Router } from "express";
import { list, create, update, remove } from "../controllers/dictionaries.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:type", list);
router.post("/:type", authMiddleware, create);
router.put("/:type/:id", authMiddleware, update);
router.delete("/:type/:id", authMiddleware, remove);

export default router;
