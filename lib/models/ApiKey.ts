import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApiKey extends Document {
  name: string;
  key: string;
  isSingleBot: boolean;
  boundIdentifier: string | null;
  boundAt: Date | null;
  lastUsedAt: Date | null;
  lastUsedIp: string | null;
  totalRequests: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    isSingleBot: {
      type: Boolean,
      default: false,
    },
    boundIdentifier: {
      type: String,
      default: null,
    },
    boundAt: {
      type: Date,
      default: null,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    lastUsedIp: {
      type: String,
      default: null,
    },
    totalRequests: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ApiKey: Model<IApiKey> =
  mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
