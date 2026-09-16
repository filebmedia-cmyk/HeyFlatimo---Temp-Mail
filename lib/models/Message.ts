import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttachment {
  filename: string;
  contentType: string;
  size: number;
}

export interface IMessage extends Document {
  recipient: string;
  sender: string;
  senderAddress?: string;
  senderName?: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  rawSize?: number;
  headers?: Record<string, any>;
  attachments?: IAttachment[];
  isRead: boolean;
  createdAt: Date;
  expiresAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sender: {
      type: String,
      required: true,
      trim: true,
    },
    senderAddress: {
      type: String,
      trim: true,
    },
    senderName: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      default: '(Tanpa Subjek)',
      trim: true,
    },
    bodyHtml: {
      type: String,
      default: '',
    },
    bodyText: {
      type: String,
      default: '',
    },
    rawSize: {
      type: Number,
      default: 0,
    },
    headers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    attachments: [
      {
        filename: String,
        contentType: String,
        size: Number,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL Index: auto-delete document when expiresAt timestamp arrives
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

// Compound index for fast queries: fetching messages for a recipient sorted by createdAt descending
MessageSchema.index({ recipient: 1, createdAt: -1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
