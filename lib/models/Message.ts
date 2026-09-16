import mongoose, { Schema, Document, Model, Connection } from 'mongoose';

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

import { getMessageConnections } from '@/lib/mongodb';

/**
 * Get or register Message model on a specific Mongoose connection
 */
export function getMessageModel(conn: Connection): Model<IMessage> {
  return (conn.models.Message as Model<IMessage>) || conn.model<IMessage>('Message', MessageSchema);
}

/**
 * Save incoming email with automatic multi-cluster failover:
 * Tries Primary (DB 2) -> Failover 1 (DB 3) -> Failover 2 (DB 4 if configured) -> Fallback (DB 1)
 */
export async function saveIncomingMessageMultiCluster(data: Partial<IMessage>): Promise<any> {
  const clusters = await getMessageConnections();
  let lastError: any = null;

  for (const cluster of clusters) {
    try {
      const model = getMessageModel(cluster.connection);
      const created = await model.create(data);
      if (created) {
        return {
          doc: created.toObject ? created.toObject() : created,
          clusterId: cluster.id,
          clusterName: cluster.name,
        };
      }
    } catch (err: any) {
      console.warn(`[MongoDB Ingestion] Gagal menyimpan ke ${cluster.name}, mencoba cluster berikutnya... Error:`, err.message);
      lastError = err;
    }
  }

  // Final fallback to default mongoose connection
  try {
    const created = await Message.create(data);
    return {
      doc: created.toObject ? created.toObject() : created,
      clusterId: 1,
      clusterName: 'Default Fallback',
    };
  } catch (err) {
    throw lastError || err;
  }
}

/**
 * Find messages across all active message clusters in parallel
 */
export async function findMessagesMultiCluster(
  query: any = {},
  options: { sort?: any; limit?: number; skip?: number } = {}
): Promise<any[]> {
  const clusters = await getMessageConnections();
  const sort = options.sort || { createdAt: -1 };
  const limit = options.limit || 50;

  const clusterPromises = clusters.map(async (cluster) => {
    try {
      const model = getMessageModel(cluster.connection);
      return await model.find(query).sort(sort).limit(limit).lean();
    } catch (err) {
      console.warn(`[MongoDB Query] Gagal membaca dari ${cluster.name}:`, err);
      return [];
    }
  });

  const results = await Promise.allSettled(clusterPromises);
  const allDocs: any[] = [];
  const seenIds = new Set<string>();

  for (const res of results) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      for (const item of res.value) {
        const idStr = item._id ? item._id.toString() : item.id;
        if (idStr && !seenIds.has(idStr)) {
          seenIds.add(idStr);
          allDocs.push({
            ...item,
            id: idStr,
          });
        }
      }
    }
  }

  // Sort unified documents by createdAt descending
  allDocs.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return allDocs.slice(options.skip || 0, (options.skip || 0) + limit);
}

/**
 * Find the latest single message for a recipient across all clusters
 */
export async function findLatestMessageMultiCluster(recipient: string): Promise<any | null> {
  const cleanRecipient = recipient.toLowerCase().trim();
  const messages = await findMessagesMultiCluster({ recipient: cleanRecipient }, { limit: 1 });
  return messages.length > 0 ? messages[0] : null;
}

/**
 * Find a message by ID across all clusters (and optionally update e.g. isRead)
 */
export async function findMessageByIdMultiCluster(id: string, updateData?: any): Promise<any | null> {
  const clusters = await getMessageConnections();

  for (const cluster of clusters) {
    try {
      const model = getMessageModel(cluster.connection);
      let doc = null;
      if (updateData) {
        doc = await model.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
      } else {
        doc = await model.findById(id).lean();
      }
      if (doc) {
        return {
          ...doc,
          id: (doc as any)._id?.toString() || (doc as any).id,
        };
      }
    } catch (err) {
      // Continue to next cluster if not found or invalid format
    }
  }

  return null;
}

/**
 * Delete a message by ID across all clusters
 */
export async function deleteMessageByIdMultiCluster(id: string): Promise<boolean> {
  const clusters = await getMessageConnections();
  let deleted = false;

  for (const cluster of clusters) {
    try {
      const model = getMessageModel(cluster.connection);
      const res = await model.findByIdAndDelete(id);
      if (res) deleted = true;
    } catch (err) {
      // Continue
    }
  }

  return deleted;
}

/**
 * Delete matching messages across all active clusters
 */
export async function deleteMessagesMultiCluster(query: any): Promise<number> {
  const clusters = await getMessageConnections();
  let totalDeleted = 0;

  const promises = clusters.map(async (cluster) => {
    try {
      const model = getMessageModel(cluster.connection);
      const res = await model.deleteMany(query);
      return res.deletedCount || 0;
    } catch (err) {
      return 0;
    }
  });

  const results = await Promise.allSettled(promises);
  for (const res of results) {
    if (res.status === 'fulfilled') {
      totalDeleted += res.value;
    }
  }

  return totalDeleted;
}

/**
 * Clean expired messages (> retentionHours) across all active clusters
 */
export async function cleanExpiredMessagesMultiCluster(retentionHours: number = 72): Promise<number> {
  const expiryDate = new Date(Date.now() - retentionHours * 3600 * 1000);
  return await deleteMessagesMultiCluster({ createdAt: { $lt: expiryDate } });
}

/**
 * Clean all messages across all active clusters
 */
export async function cleanAllMessagesMultiCluster(): Promise<number> {
  return await deleteMessagesMultiCluster({});
}

/**
 * Aggregate cluster stats across all active message clusters
 */
export async function getClusterStatsMultiCluster(retentionHours: number = 72) {
  const clusters = await getMessageConnections();
  const expiryDate = new Date(Date.now() - retentionHours * 3600 * 1000);

  let totalMessages = 0;
  let expiredCount = 0;
  const uniqueMailboxes = new Set<string>();
  let oldestCreatedAt: string | null = null;

  const promises = clusters.map(async (cluster) => {
    try {
      const model = getMessageModel(cluster.connection);
      const count = await model.countDocuments({});
      const expired = await model.countDocuments({ createdAt: { $lt: expiryDate } });
      const recipients = await model.distinct('recipient');
      const oldestDoc = await model.findOne({}, {}, { sort: { createdAt: 1 } }).lean();

      return {
        count,
        expired,
        recipients,
        oldest: oldestDoc ? (oldestDoc as any).createdAt : null,
      };
    } catch (err) {
      return { count: 0, expired: 0, recipients: [], oldest: null };
    }
  });

  const results = await Promise.allSettled(promises);
  for (const res of results) {
    if (res.status === 'fulfilled') {
      totalMessages += res.value.count;
      expiredCount += res.value.expired;
      for (const rec of res.value.recipients) {
        if (rec) uniqueMailboxes.add(rec);
      }
      if (res.value.oldest) {
        const oldestDate = new Date(res.value.oldest);
        if (!oldestCreatedAt || oldestDate < new Date(oldestCreatedAt)) {
          oldestCreatedAt = oldestDate.toISOString();
        }
      }
    }
  }

  return {
    totalMessages,
    expiredCount,
    uniqueActiveMailboxes: uniqueMailboxes.size,
    oldestCreatedAt,
    retentionHours,
  };
}
