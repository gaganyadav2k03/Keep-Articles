import { Request, Response } from "express";
import {JwtPayload} from "jsonwebtoken";
import {User} from "../model/user.model";
import { AuthenticatedRequest } from '../middleware/verifyAccessToken';
export const userMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = req.user as JwtPayload;
   
    res.json(userInfo);
    console.log("this is me", userInfo);
    return;
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }

};    