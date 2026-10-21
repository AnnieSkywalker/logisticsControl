import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  create,
  list,
  getOne,
  update,
  remove,
  exportOrders,
} from "../controllers/orders.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const createLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Слишком много заявок. Подождите немного." },
});

const router = Router();

router.post("/", createLimiter, create);

router.get("/export", authMiddleware, exportOrders);
router.get("/", authMiddleware, list);
router.get("/:id", authMiddleware, getOne);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);

export default router;
