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

const addMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo=req.user as JwtPayload
    const userId=userInfo?.id;
    const { sender, receiver, text } = req?.body;
    console.log(sender, receiver, text);
    if (!sender || !receiver || !text) {
      res.status(400).json({
        message: "data is missing",
      });
      return;
    }
    const socketid=connectedUsers.get(receiver as string)
    const message=await Message.create({
      sender,
      receiver,
      text,
    });
    console.log("shocket id ",socketid)
    if(socketid){
        io.to(socketid).emit('receive-message',message);
        console.log("message emited",message,socketid)
    }
    //handling messageData
    const user=await User.findOne({_id:userId});
   const alreadyMessaged = user?.messageData?.includes(receiver);

    if (alreadyMessaged) {
      await User.findByIdAndUpdate(userId, {
        $pull: { messageData: receiver },
      });
      user?.messageData?.push(receiver);
    } else {
      await user?.messageData.push(receiver);
    }

    await user?.save();

//


    console.log("message created");
    res.status(400).json({ message: "sent successfully" });
    return;
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ message: "Internal error" });
    return;
  }
};

const messageById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = req.user as JwtPayload;
    const receiver = userInfo?.id;
    const sender = req?.params?.id;
    console.log("from all messages ", receiver);
    const messages = await Message.find({
      $or: [
        { receiver: receiver, sender: sender },
        { receiver: sender, sender: receiver }
      ]
    });
    console.log("messages are here", messages);
    res.status(200).json(messages);

    return;
  } catch (error) {
    res.status(400).json(`internal error`);
  }
};