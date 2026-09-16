import { NextRequest, NextResponse } from 'next/server';
import { getClusterHealth } from '@/lib/mongodb';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/clusters - Returns status of all 4 MongoDB Clusters
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    const clusters = await getClusterHealth();
    const configuredCount = clusters.filter((c) => c.configured).length;
    const connectedCount = clusters.filter((c) => c.status === 'connected').length;

    return NextResponse.json({
      success: true,
      clusters,
      summary: {
        total: clusters.length,
        configured: configuredCount,
        connected: connectedCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil status cluster MongoDB', details: err.message },
      { status: 500 }
    );
  }
}
