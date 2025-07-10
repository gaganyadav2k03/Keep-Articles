// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { toJSONPlugin } from '../utils/toJSONPlugin';
import { ref } from 'process';

interface messageData{
  userIds:mongoose.Types.ObjectId;
  unreadCount:number;
}

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  articles: mongoose.Types.ObjectId[];
  messageData:mongoose.Types.ObjectId[];
  following:mongoose.Types.ObjectId[];
  followers:mongoose.Types.ObjectId[];
  generateAccessToken(): string;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  articles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
  messageData:[{type:Schema.Types.ObjectId,ref:'User'}],
  following:[{type:Schema.Types.ObjectId,ref:'User'}],
  followers:[{type:Schema.Types.ObjectId,ref:'User'}],
});

UserSchema.plugin(toJSONPlugin)

// Hash password before saving user
UserSchema.pre<IUser>('save', async function (next) {
  if (this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

UserSchema.methods.generateAccessToken = function (): string {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    name: this.name,
  };
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
  });
}
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
}

const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export {User, IUser};