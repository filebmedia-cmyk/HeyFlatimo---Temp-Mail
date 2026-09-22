import mongoose, { Schema, Document, Model } from 'mongoose';

export type BotActionType =
  | 'generate'
  | 'otp'
  | 'links'
  | 'inbox'
  | 'message_detail'
  | 'delete_inbox'
  | 'domains'
  | 'auth_error';

export type BotLogStatus = 'success' | 'waiting' | 'error' | 'blocked';

export interface IBotLog extends Document {
  action: BotActionType;
  keyName?: string;
  apiKeySnippet?: string;
  ip?: string;
  botId?: string;
  email?: string;
  otp?: string | null;
  link?: string | null;
  status: BotLogStatus;
  statusCode: number;
  message: string;
  responseTimeMs?: number;
  createdAt: Date;
}

const BotLogSchema = new Schema<IBotLog>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    keyName: {
      type: String,
      default: 'Unknown / Master',
      trim: true,
    },
    apiKeySnippet: {
      type: String,
      default: '',
      trim: true,
    },
    ip: {
      type: String,
      default: '127.0.0.1',
      trim: true,
    },
    botId: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      default: null,
      trim: true,
    },
    link: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ['success', 'waiting', 'error', 'blocked'],
      default: 'success',
      index: true,
    },
    statusCode: {
      type: Number,
      default: 200,
      index: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 86400 }, // 24 Hours TTL (86400 seconds)
    },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Compound index for querying recent logs sorted by createdAt descending
BotLogSchema.index({ createdAt: -1 });
BotLogSchema.index({ action: 1, createdAt: -1 });

export const BotLog: Model<IBotLog> =
  mongoose.models.BotLog || mongoose.model<IBotLog>('BotLog', BotLogSchema);
