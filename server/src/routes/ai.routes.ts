import { Router } from "express";
import { generateDescription } from "../controllers/ai.controller"
import { verifyAccessToken } from "../middleware/verifyAccessToken";

const router = Router();

router.post("/describe", verifyAccessToken,generateDescription);

export default router;