import { NextRequest, NextResponse } from 'next/server';
import { getAccessSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const key = typeof body?.key === 'string' ? body.key.trim() : '';

    const access = await getAccessSettings();

    if (!access.enabled) {
      return NextResponse.json({
        success: true,
        message: 'Akses terbuka tanpa proteksi key',
        token: 'free_access',
      });
    }

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Silakan masukkan kode akses' },
        { status: 400 }
      );
    }

    if (key === access.key) {
      return NextResponse.json({
        success: true,
        message: 'Kode akses valid',
        token: `verified_${Buffer.from(key).toString('base64')}`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Kode akses salah. Silakan periksa kembali!' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
