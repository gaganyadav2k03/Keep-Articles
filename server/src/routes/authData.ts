import { Router } from "express";

import { verifyAccessToken } from "../middleware/verifyAccessToken";
import { userMe } from "../controllers/authController";
export const userData = Router();
userData.get("/", verifyAccessToken, userMe);
