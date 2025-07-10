// models/Notification.ts
import mongoose from "mongoose";

interface INotify{
  recipient:mongoose.Types.ObjectId;
  sender:mongoose.Types.ObjectId;
  type:string;
  message:string;
  read:boolean;
  articleId?:mongoose.Types.ObjectId
}
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["like","message"], required: true },
    message: String,
    read: { type: Boolean, default: false },
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: "Article",required:false },
    
  },
  { timestamps: true }
);
 export const Notification: mongoose.Model<INotify> = mongoose.model<INotify>("Notification", notificationSchema);
// export default const mongoose.model("Notification", notificationSchema);
