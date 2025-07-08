import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import * as cookie from "cookie";




// Extend the Socket interface to include 'user'
declare module "socket.io" {
  interface Socket {
    user?: string | jwt.JwtPayload;
  }
}


interface AuthenticatedRequest extends Request {
  user?: string | jwt.JwtPayload;
}

const verifyAccessToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // console.log('from access token');
    const accessToken = req.cookies.accessToken;
    // console.log("Access Token:", accessToken);

    if (!accessToken) {
      res.status(400).json("Forbidden: No access token provided");
      return;
    }

    jwt.verify(accessToken, process.env.JWT_SECRET as string, (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
      if (err) {
        throw new Error("Forbidden: Invalid token");
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Invalid access token:", error);
    throw new Error("Forbidden: Invalid access token");
  }
};

// ✅ Socket.IO Authentication Middleware (added only this)
const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const cookies = socket.handshake.headers.cookie;
    console.log("raw cokiir")

    if (!cookies) {
      console.log("❌ No cookie header found");
      return next(new Error("Unauthorized: No cookies found"));
    }
    console.log("cokie")

    const { accessToken } = cookie.parse(cookies);

    if (!accessToken) {
      console.log("❌ No access token in cookies");
      return next(new Error("Unauthorized: No access token"));
    }

    jwt.verify(accessToken, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err || !decoded) {
        console.log("❌ Invalid token");
        return next(new Error("Unauthorized: Invalid token"));
      }
       console.log("Un Authenticated socket:", decoded);  
      (socket as any).user = decoded;
      console.log("✅ Authenticated socket:", decoded);
      next();
    });
  } catch (err) {
    console.log("❌ Auth middleware error:", err);
    next(new Error("Unauthorized: Token verification failed"));
  }
};

export { verifyAccessToken, AuthenticatedRequest, socketAuthMiddleware };
