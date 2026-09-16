import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyDetailed } from '@/lib/auth';
import { getSystemStats } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized: Invalid or missing API Key' },
      { status: auth.status || 401 }
    );
  }

  try {
    const stats = await getSystemStats();

    return NextResponse.json({
      success: true,
      service: 'HeyFlatimo Developer API',
      status: 'online',
      database: 'connected',
      totalReceivedAllTime: stats.totalReceivedAllTime,
      totalMessages: stats.activeMessages,
      activeMessages: stats.activeMessages,
      unreadMessages: stats.unreadMessages,
      totalDeletedAllTime: stats.totalDeletedAllTime,
      totalGeneratedAllTime: stats.totalGeneratedAllTime,
      uniqueActiveMailboxes: stats.uniqueActiveMailboxes,
      retentionHours: stats.retentionHours,
      oldestCreatedAt: stats.oldestCreatedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      service: 'HeyFlatimo Developer API',
      status: 'online',
      database: 'offline_or_connecting',
      totalReceivedAllTime: 0,
      totalMessages: 0,
      activeMessages: 0,
      unreadMessages: 0,
      totalDeletedAllTime: 0,
      totalGeneratedAllTime: 0,
      uniqueActiveMailboxes: 0,
      retentionHours: 24,
      oldestCreatedAt: null,
      timestamp: new Date().toISOString(),
      warning: err.message,
    });
  }
}
