import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import { Setting } from '@/lib/models/Setting';
import { getCurrentApiKey, verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Anda wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    const key = await getCurrentApiKey();
    return NextResponse.json({
      success: true,
      apiKey: key,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil API Key', details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Anda wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    // Generate new secure key: hfl_live_ + 32 chars hex
    const randomHex = crypto.randomBytes(16).toString('hex');
    const newKey = `hfl_live_${randomHex}`;

    await connectToDatabase();

    await Setting.findOneAndUpdate(
      { key: 'admin_api_key' },
      { $set: { key: 'admin_api_key', value: newKey, updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'API Key berhasil direset!',
      apiKey: newKey,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal mereset API Key', details: err.message },
      { status: 500 }
    );
  }
}
