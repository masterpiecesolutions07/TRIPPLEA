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

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(morgan(env.nodeEnv === "test" ? "tiny" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(sanitizeBody);
app.use("/api/v1", routes);
app.use(errorMiddleware);

export default app;
