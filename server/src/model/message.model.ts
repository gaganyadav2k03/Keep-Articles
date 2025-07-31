import mongoose from "mongoose";
export interface IMessage {
  
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  text: string;
  isRead:Boolean
  createdAt:Date;
  updatedAt:Date
  
  
}

const MessageSchema= new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text:String,
  isRead: { type: Boolean, default: false }
},{
  timestamps:true
})
MessageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });

export const Message: mongoose.Model<IMessage> = mongoose.model<IMessage>("Message", MessageSchema);