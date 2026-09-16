import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
  cleanAllMessagesMultiCluster,
  cleanExpiredMessagesMultiCluster,
  getClusterStatsMultiCluster,
} from '@/lib/models/Message';
import { getRetentionSettings } from '@/lib/settings';
import { verifyAdminRequest } from '@/lib/auth';
import { getSystemStats, recordDeletedEmails } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const systemStats = await getSystemStats();
    const clusterStats = await getClusterStatsMultiCluster(systemStats.retentionHours || 72);

    return NextResponse.json({
      success: true,
      totalMessages: clusterStats.totalMessages,
      activeMessages: clusterStats.totalMessages,
      totalReceivedAllTime: systemStats.totalReceivedAllTime,
      totalDeletedAllTime: systemStats.totalDeletedAllTime,
      totalGeneratedAllTime: systemStats.totalGeneratedAllTime,
      uniqueActiveMailboxes: clusterStats.uniqueActiveMailboxes || systemStats.uniqueActiveMailboxes,
      unreadMessages: systemStats.unreadMessages,
      expiredCount: clusterStats.expiredCount,
      oldestCreatedAt: clusterStats.oldestCreatedAt || systemStats.oldestCreatedAt,
      retentionHours: systemStats.retentionHours || 72,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'clean_expired';
    await connectToDatabase();

    if (action === 'clean_all') {
      const deletedCount = await cleanAllMessagesMultiCluster();
      if (deletedCount > 0) {
        await recordDeletedEmails(deletedCount).catch(() => null);
      }
      return NextResponse.json({
        success: true,
        deletedCount: deletedCount,
        message: `Berhasil menghapus seluruh ${deletedCount} pesan email dari semua cluster database.`,
      });
    }

    // Default: clean expired based on hours
    const retention = await getRetentionSettings();
    const hours = typeof body.hours === 'number' ? body.hours : (retention.retentionHours || 72);

    if (hours <= 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: 'Pengaturan retensi dinonaktifkan (0 jam). Tidak ada pesan yang dihapus.',
      });
    }

    const deletedCount = await cleanExpiredMessagesMultiCluster(hours);
    if (deletedCount > 0) {
      await recordDeletedEmails(deletedCount).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      deletedCount: deletedCount,
      message: `Berhasil membersihkan ${deletedCount} pesan email yang lebih lama dari ${hours} jam dari semua cluster database.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
