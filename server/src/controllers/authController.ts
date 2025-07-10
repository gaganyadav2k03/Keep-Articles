import { Request, Response } from "express";
import {JwtPayload} from "jsonwebtoken";
import {User} from "../model/user.model";
import { AuthenticatedRequest } from '../middleware/verifyAccessToken';
export const userMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = req.user as JwtPayload;
    const user=await User.findById(userInfo?.id);
    // console.log(user);
   
    res.json({
      id:userInfo?.id,
      role:userInfo?.role,
      name:userInfo?.name,
      email:userInfo?.email,
      following:user?.following,
      followers:user?.followers

  });
  console.log(user?.following,"name");
    return;
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }

};    