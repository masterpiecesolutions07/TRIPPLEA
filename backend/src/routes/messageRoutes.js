import { Router } from "express";
import { createMessage } from "../controllers/messageController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validateMiddleware.js";
import { messageSchema } from "../validators/messageValidators.js";

const router = Router();

router.post("/", authLimiter, validate(messageSchema), createMessage);

export default router;
