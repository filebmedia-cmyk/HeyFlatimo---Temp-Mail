import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import { ApiKey } from '@/lib/models/ApiKey';
import { verifyAdminRequest, getCurrentApiKey } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/apikeys - List all API Keys
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

    let keys: any[] = await ApiKey.find({}).sort({ createdAt: -1 }).lean();

    // Auto-seed initial master key if collection is completely empty
    if (keys.length === 0) {
      const masterKey = await getCurrentApiKey();
      const defaultKey = await ApiKey.create({
        name: 'Master API Key (Default)',
        key: masterKey,
        isSingleBot: false,
        isActive: true,
      });
      keys = [defaultKey.toObject()];
    }

    const formattedKeys = keys.map((k: any) => ({
      id: k._id.toString(),
      name: k.name || 'Untitled Bot',
      key: k.key,
      isSingleBot: Boolean(k.isSingleBot),
      boundIdentifier: k.boundIdentifier || null,
      boundAt: k.boundAt ? new Date(k.boundAt).toISOString() : null,
      lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt).toISOString() : null,
      lastUsedIp: k.lastUsedIp || null,
      totalRequests: k.totalRequests || 0,
      isActive: k.isActive !== false,
      createdAt: k.createdAt ? new Date(k.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      keys: formattedKeys,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil daftar API Key', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/apikeys - Create new API Key (Custom or Generated)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Anda wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawName = body.name?.trim();
    const rawKey = body.key?.trim();
    const isSingleBot = Boolean(body.isSingleBot);

    if (!rawName) {
      return NextResponse.json(
        { error: 'Judul / Nama Bot wajib diisi.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Generate random key if empty, or clean custom key
    let finalKey = rawKey;
    if (!finalKey) {
      const randomHex = crypto.randomBytes(16).toString('hex');
      finalKey = `hfl_live_${randomHex}`;
    }

    // Check duplicate key
    const existing = await ApiKey.findOne({ key: finalKey });
    if (existing) {
      return NextResponse.json(
        { error: `API Key "${finalKey}" sudah digunakan oleh bot "${existing.name}". Silakan gunakan nilai key yang berbeda.` },
        { status: 400 }
      );
    }

    const created = await ApiKey.create({
      name: rawName,
      key: finalKey,
      isSingleBot: isSingleBot,
      boundIdentifier: null,
      boundAt: null,
      lastUsedAt: null,
      lastUsedIp: null,
      totalRequests: 0,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'API Key baru berhasil dibuat.',
      key: {
        id: created._id.toString(),
        name: created.name,
        key: created.key,
        isSingleBot: created.isSingleBot,
        boundIdentifier: null,
        boundAt: null,
        lastUsedAt: null,
        lastUsedIp: null,
        totalRequests: 0,
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal membuat API Key', details: err.message },
      { status: 500 }
    );
  }
}
