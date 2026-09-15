import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { getRetentionSettings } from '@/lib/settings';
import { verifyAdminRequest } from '@/lib/auth';

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
    const retention = await getRetentionSettings();
    const totalMessages = await Message.countDocuments();

    let expiredCount = 0;
    if (retention.retentionHours > 0) {
      const expiryDate = new Date(Date.now() - retention.retentionHours * 60 * 60 * 1000);
      expiredCount = await Message.countDocuments({ createdAt: { $lt: expiryDate } });
    }

    const oldestMessage = await Message.findOne().sort({ createdAt: 1 }).select('createdAt').lean();

    return NextResponse.json({
      success: true,
      totalMessages,
      expiredCount,
      oldestCreatedAt: oldestMessage ? (oldestMessage as any).createdAt : null,
      retentionHours: retention.retentionHours,
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
      return NextResponse.json({
        success: true,
        deletedCount: result.deletedCount,
        message: `Berhasil menghapus seluruh ${result.deletedCount} pesan email dari database.`,
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

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Berhasil membersihkan ${result.deletedCount} pesan email yang lebih lama dari ${hours} jam.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
