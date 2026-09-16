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

    // Auto-purge expired messages if retention is active (e.g. 72h / 3 days) across all clusters
    if (retention.retentionHours > 0) {
      const { cleanExpiredMessagesMultiCluster } = await import('@/lib/models/Message');
      const purgedCount = await cleanExpiredMessagesMultiCluster(retention.retentionHours);
      if (purgedCount > 0) {
        metrics.totalDeletedAllTime += purgedCount;
        await Setting.findOneAndUpdate(
          { key: 'system_metrics' },
          { value: JSON.stringify(metrics), updatedAt: new Date() },
          { upsert: true }
        ).catch(() => null);
      }
    }

    // Live counts from all active message clusters
    const { getClusterStatsMultiCluster } = await import('@/lib/models/Message');
    const clusterStats = await getClusterStatsMultiCluster(retention.retentionHours || 72);

    const activeMessages = clusterStats.totalMessages;
    const uniqueActiveMailboxes = clusterStats.uniqueActiveMailboxes;
    const oldestCreatedAt = clusterStats.oldestCreatedAt;

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
      unreadMessages: 0,
      totalDeletedAllTime: metrics.totalDeletedAllTime,
      totalGeneratedAllTime: metrics.totalGeneratedAllTime,
      uniqueActiveMailboxes: uniqueActiveMailboxes,
      oldestCreatedAt: oldestCreatedAt,
      retentionHours: retention.retentionHours || 72,
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
