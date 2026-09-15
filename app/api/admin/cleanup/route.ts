import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
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

    let expiredCount = 0;
    if (systemStats.retentionHours > 0) {
      const expiryDate = new Date(Date.now() - systemStats.retentionHours * 60 * 60 * 1000);
      expiredCount = await Message.countDocuments({ createdAt: { $lt: expiryDate } });
    }

    return NextResponse.json({
      success: true,
      totalMessages: systemStats.activeMessages,
      activeMessages: systemStats.activeMessages,
      totalReceivedAllTime: systemStats.totalReceivedAllTime,
      totalDeletedAllTime: systemStats.totalDeletedAllTime,
      totalGeneratedAllTime: systemStats.totalGeneratedAllTime,
      uniqueActiveMailboxes: systemStats.uniqueActiveMailboxes,
      unreadMessages: systemStats.unreadMessages,
      expiredCount,
      oldestCreatedAt: systemStats.oldestCreatedAt,
      retentionHours: systemStats.retentionHours,
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
      const result = await Message.deleteMany({});
      const deletedCount = result.deletedCount || 0;
      if (deletedCount > 0) {
        await recordDeletedEmails(deletedCount).catch(() => null);
      }
      return NextResponse.json({
        success: true,
        deletedCount: deletedCount,
        message: `Berhasil menghapus seluruh ${deletedCount} pesan email dari database.`,
      });
    }

    // Default: clean expired based on hours
    const retention = await getRetentionSettings();
    const hours = typeof body.hours === 'number' ? body.hours : retention.retentionHours;

    if (hours <= 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: 'Pengaturan retensi dinonaktifkan (0 jam). Tidak ada pesan yang dihapus.',
      });
    }

    const expiryDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    const result = await Message.deleteMany({ createdAt: { $lt: expiryDate } });
    const deletedCount = result.deletedCount || 0;
    if (deletedCount > 0) {
      await recordDeletedEmails(deletedCount).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      deletedCount: deletedCount,
      message: `Berhasil membersihkan ${deletedCount} pesan email yang lebih lama dari ${hours} jam.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
