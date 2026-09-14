import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDomain extends Document {
  domain: string;
  isVip: boolean;
  createdAt: Date;
}

const DomainSchema = new Schema<IDomain>(
  {
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    isVip: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

export const Domain: Model<IDomain> =
  mongoose.models.Domain || mongoose.model<IDomain>('Domain', DomainSchema);
