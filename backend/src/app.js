import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { sanitizeBody } from "./middleware/sanitizeMiddleware.js";
import routes from "./routes/index.js";

const app = express();
const uploads = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");

app.set("trust proxy", 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true
}));
app.use(morgan(env.nodeEnv === "test" ? "tiny" : "dev"));
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "Tripple A API",
    url: env.publicUrl || null
  });
});
app.use("/uploads", express.static(uploads));
app.use(express.json({ limit: "4mb" }));
app.use(cookieParser());
app.use(sanitizeBody);
app.use("/api/v1", routes);
app.use(routes);
app.use(errorMiddleware);

export default app;
