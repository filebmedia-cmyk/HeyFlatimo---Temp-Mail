import { connectToDatabase } from '@/lib/mongodb';
import { Setting } from '@/lib/models/Setting';
import { Message } from '@/lib/models/Message';
import { getRetentionSettings } from '@/lib/settings';

export interface SystemStats {
  totalReceivedAllTime: number;
  activeMessages: number;
  unreadMessages: number;
  totalDeletedAllTime: number;
  totalGeneratedAllTime: number;
  uniqueActiveMailboxes: number;
  oldestCreatedAt: string | null;
  retentionHours: number;
}

interface StoredMetrics {
  totalReceivedAllTime: number;
  totalDeletedAllTime: number;
  totalGeneratedAllTime: number;
}

const DEFAULT_METRICS: StoredMetrics = {
  totalReceivedAllTime: 0,
  totalDeletedAllTime: 0,
  totalGeneratedAllTime: 0,
};

/**
 * Record an incoming email to persistent lifetime metrics
 */
export async function recordIncomingEmail(count: number = 1): Promise<void> {
  if (count <= 0) return;
  try {
    await connectToDatabase();
    const existing = await Setting.findOne({ key: 'system_metrics' }).lean();
    let currentMetrics: StoredMetrics = DEFAULT_METRICS;

    if (existing && existing.value) {
      try {
        currentMetrics = { ...DEFAULT_METRICS, ...JSON.parse(existing.value) };
      } catch (e) {}
    }

    currentMetrics.totalReceivedAllTime += count;

    await Setting.findOneAndUpdate(
      { key: 'system_metrics' },
      { value: JSON.stringify(currentMetrics), updatedAt: new Date() },
      { upsert: true }
    );
  } catch (err) {
    console.error('Error recording incoming email metric:', err);
  }
}

/**
 * Record deleted messages to persistent lifetime metrics
 */
export async function recordDeletedEmails(count: number): Promise<void> {
  if (!count || count <= 0) return;
  try {
    await connectToDatabase();
    const existing = await Setting.findOne({ key: 'system_metrics' }).lean();
    let currentMetrics: StoredMetrics = DEFAULT_METRICS;

    if (existing && existing.value) {
      try {
        currentMetrics = { ...DEFAULT_METRICS, ...JSON.parse(existing.value) };
      } catch (e) {}
    }

    currentMetrics.totalDeletedAllTime += count;

    await Setting.findOneAndUpdate(
      { key: 'system_metrics' },
      { value: JSON.stringify(currentMetrics), updatedAt: new Date() },
      { upsert: true }
    );
  } catch (err) {
    console.error('Error recording deleted emails metric:', err);
  }
}

/**
 * Record a generated email address to persistent lifetime metrics
 */
export async function recordGeneratedEmail(count: number = 1): Promise<void> {
  if (count <= 0) return;
  try {
    await connectToDatabase();
    const existing = await Setting.findOne({ key: 'system_metrics' }).lean();
    let currentMetrics: StoredMetrics = DEFAULT_METRICS;

    if (existing && existing.value) {
      try {
        currentMetrics = { ...DEFAULT_METRICS, ...JSON.parse(existing.value) };
      } catch (e) {}
    }

    currentMetrics.totalGeneratedAllTime += count;

    await Setting.findOneAndUpdate(
      { key: 'system_metrics' },
      { value: JSON.stringify(currentMetrics), updatedAt: new Date() },
      { upsert: true }
    );
  } catch (err) {
    console.error('Error recording generated email metric:', err);
  }
}

/**
 * Get comprehensive lifetime and real-time statistics
 */
export async function getSystemStats(): Promise<SystemStats> {
  try {
    await connectToDatabase();
    const retention = await getRetentionSettings();

    // Fetch persistent lifetime metrics
    const setting = await Setting.findOne({ key: 'system_metrics' }).lean();
    let metrics: StoredMetrics = { ...DEFAULT_METRICS };

    if (setting && setting.value) {
      try {
        metrics = { ...DEFAULT_METRICS, ...JSON.parse(setting.value) };
      } catch (e) {}
    }

    // Auto-purge expired messages if retention is active (e.g. 72h / 3 days)
    if (retention.retentionHours > 0) {
      const expiryDate = new Date(Date.now() - retention.retentionHours * 60 * 60 * 1000);
      const purgeResult = await Message.deleteMany({
        $or: [
          { expiresAt: { $lte: new Date() } },
          { createdAt: { $lt: expiryDate } },
        ],
      });
      if (purgeResult.deletedCount && purgeResult.deletedCount > 0) {
        metrics.totalDeletedAllTime += purgeResult.deletedCount;
        await Setting.findOneAndUpdate(
          { key: 'system_metrics' },
          { value: JSON.stringify(metrics), updatedAt: new Date() },
          { upsert: true }
        ).catch(() => null);
      }
    }

    // Live counts from MongoDB
    const activeMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ isRead: false });
    const uniqueRecipients = await Message.distinct('recipient');
    const oldestMessage = await Message.findOne().sort({ createdAt: 1 }).select('createdAt').lean();

    // Baseline safeguard: totalReceivedAllTime should be at least activeMessages + totalDeletedAllTime
    const calculatedMinimum = activeMessages + metrics.totalDeletedAllTime;
    let totalReceived = Math.max(metrics.totalReceivedAllTime, calculatedMinimum);

    if (totalReceived > metrics.totalReceivedAllTime) {
      metrics.totalReceivedAllTime = totalReceived;
      await Setting.findOneAndUpdate(
        { key: 'system_metrics' },
        { value: JSON.stringify(metrics), updatedAt: new Date() },
        { upsert: true }
      ).catch(() => null);
    }

    return {
      totalReceivedAllTime: totalReceived,
      activeMessages: activeMessages,
      unreadMessages: unreadMessages,
      totalDeletedAllTime: metrics.totalDeletedAllTime,
      totalGeneratedAllTime: metrics.totalGeneratedAllTime,
      uniqueActiveMailboxes: uniqueRecipients.length,
      oldestCreatedAt: oldestMessage ? ((oldestMessage as any).createdAt?.toISOString() || null) : null,
      retentionHours: retention.retentionHours,
    };
  } catch (err: any) {
    console.error('Error fetching system stats:', err);
    return {
      totalReceivedAllTime: 0,
      activeMessages: 0,
      unreadMessages: 0,
      totalDeletedAllTime: 0,
      totalGeneratedAllTime: 0,
      uniqueActiveMailboxes: 0,
      oldestCreatedAt: null,
      retentionHours: 24,
    };
  }
}
