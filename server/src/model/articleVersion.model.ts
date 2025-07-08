// models/ArticleVersion.ts
import mongoose, { Document, Schema } from 'mongoose';
import { toJSONPlugin } from '../utils/toJSONPlugin';

export interface IArticleVersion extends Document {
  article: mongoose.Types.ObjectId;
  description: string;
  updatedAt: Date;
}

const articleVersionSchema = new Schema<IArticleVersion>({
  article: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
  description: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});
articleVersionSchema.plugin(toJSONPlugin)
export const ArticleVersion = mongoose.model<IArticleVersion>(
  'ArticleVersion',
  articleVersionSchema
);
