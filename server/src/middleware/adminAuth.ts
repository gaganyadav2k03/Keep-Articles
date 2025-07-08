import { NextFunction, Request, Response } from "express";

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token=req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(403).json({ message: "Forbidden: No token provided" });
      return;
    }
    if (token !== process.env.Admin_Password) {
      res.status(403).json({ message: "Forbidden: Invalid token" });
      return;
    }
    next();
  } catch (error) {
     res.status(500).json({ message: "Internal Server Error" });
     
  }
}