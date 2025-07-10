import { NextFunction, Request, Response } from "express";
import { User, IUser } from "../model/user.model";
import { Article, IArticle } from "../model/article.model";
import { ArticleVersion } from "../model/articleVersion.model";
import { Types } from "mongoose";
import validator from "validator";
import { AuthenticatedRequest } from "../middleware/verifyAccessToken";
import { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../utils/customError";
import { io, connectedUsers } from "../../server";
import { Notification } from "../model/notify.model";
import { Message } from "../model/message.model";
import mongoose from "mongoose";



const getUnreadCounts = async (req:AuthenticatedRequest, res:Response) => {
  const currentUser = req.user as JwtPayload
  const currentUserId=currentUser?.id

  try {
    const unread = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(currentUserId),
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    const result: { [key: string]: number } = {};
    unread.forEach((item) => {
      result[item?._id.toString()] = item.count;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to get unread counts" });
  }
};

const markMessagesAsRead = async (req:AuthenticatedRequest ,res:Response) => {
   const currentUser = req.user as JwtPayload
  const currentUserId=currentUser?.id
  const fromUserId = req?.params?.userId;

  try {
    await Message.updateMany(
      {
        sender: fromUserId,
        receiver: currentUserId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );
    res.status(200).json({message:"marked"});
  } catch (err) {
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};


export {
  getUnreadCounts,
  markMessagesAsRead
}