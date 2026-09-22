import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BotLog } from '@/lib/models/BotLog';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * GET /api/admin/logs - Fetch recent bot logs & summary stats (Past 24 Hours)
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Anda wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const limitParam = parseInt(searchParams.get('limit') || '300', 10);
    const limit = Math.min(Math.max(limitParam, 10), 1000);
    const actionFilter = searchParams.get('action')?.trim().toLowerCase();
    const querySearch = searchParams.get('q')?.trim();
    const sinceParam = searchParams.get('since')?.trim();

    const query: any = {};

    // Filter by action
    if (actionFilter && actionFilter !== 'all') {
      if (actionFilter === 'error' || actionFilter === 'blocked') {
        query.status = { $in: ['error', 'blocked'] };
      } else {
        query.action = actionFilter;
      }
    }

    // Filter by search term
    if (querySearch) {
      const reg = new RegExp(escapeRegex(querySearch), 'i');
      query.$or = [
        { email: reg },
        { keyName: reg },
        { ip: reg },
        { otp: reg },
        { link: reg },
        { message: reg },
      ];
    }

    // Filter newer than specific timestamp
    if (sinceParam) {
      const sinceDate = new Date(sinceParam);
      if (!isNaN(sinceDate.getTime())) {
        query.createdAt = { $gt: sinceDate };
      }
    }

    const logs = await BotLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // 24-hour summary metrics
    const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [totalHits, otpSuccess, linkSuccess, blockedOrError] = await Promise.all([
      BotLog.countDocuments({ createdAt: { $gte: past24h } }),
      BotLog.countDocuments({
        action: 'otp',
        status: 'success',
        createdAt: { $gte: past24h },
      }),
      BotLog.countDocuments({
        action: 'links',
        status: 'success',
        createdAt: { $gte: past24h },
      }),
      BotLog.countDocuments({
        status: { $in: ['error', 'blocked'] },
        createdAt: { $gte: past24h },
      }),
    ]);

    const formattedLogs = logs.map((log: any) => ({
      id: log._id.toString(),
      action: log.action,
      keyName: log.keyName || 'Master Key',
      apiKeySnippet: log.apiKeySnippet || '',
      ip: log.ip || '127.0.0.1',
      botId: log.botId || '',
      email: log.email || '',
      otp: log.otp || null,
      link: log.link || null,
      status: log.status || 'success',
      statusCode: log.statusCode || 200,
      message: log.message || '',
      responseTimeMs: log.responseTimeMs || 0,
      createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      stats: {
        totalHits24h: totalHits,
        otpSuccess24h: otpSuccess,
        linkSuccess24h: linkSuccess,
        blockedOrError24h: blockedOrError,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil logs bot', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/logs - Clear / Flush all logs
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Anda wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const result = await BotLog.deleteMany({});
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount || 0,
      message: `Semua riwayat console logs (${result.deletedCount || 0} entri) berhasil dibersihkan.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal menghapus logs', details: err.message },
      { status: 500 }
    );
  }
}
