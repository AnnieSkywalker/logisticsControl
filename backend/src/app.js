import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { errorHandler } from "./middleware/error.middleware.js";
import { setupSwagger } from "./swagger/swagger.js";

import authRoutes from "./routes/auth.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import dictionariesRoutes from "./routes/dictionaries.routes.js";
import ordersRoutes from "./routes/orders.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.set("trust proxy", 1);

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : true;
app.use(cors({ origin: corsOrigin }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Слишком много попыток входа. Подождите 15 минут." },
});
app.use("/api/auth/login", loginLimiter);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dictionaries", dictionariesRoutes);
app.use("/api/orders", ordersRoutes);

app.use(errorHandler);
setupSwagger(app);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
