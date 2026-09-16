import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ApiKey } from '@/lib/models/ApiKey';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/apikeys/[id] - Update API Key, Toggle Status, or Reset Lock Binding
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Anda wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));

    await connectToDatabase();

    const apiKeyDoc = await ApiKey.findById(id);
    if (!apiKeyDoc) {
      return NextResponse.json(
        { error: 'API Key tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 1. Action: Reset Binding Lock
    if (body.resetBinding) {
      apiKeyDoc.boundIdentifier = null;
      apiKeyDoc.boundAt = null;
    }

    // 2. Action: Toggle Active Status
    if (typeof body.isActive === 'boolean') {
      apiKeyDoc.isActive = body.isActive;
    }

    // 3. Action: Toggle Single Bot Mode
    if (typeof body.isSingleBot === 'boolean') {
      apiKeyDoc.isSingleBot = body.isSingleBot;
      if (!body.isSingleBot) {
        apiKeyDoc.boundIdentifier = null;
        apiKeyDoc.boundAt = null;
      }
    }

    // 4. Action: Update Name
    if (typeof body.name === 'string' && body.name.trim()) {
      apiKeyDoc.name = body.name.trim();
    }

    await apiKeyDoc.save();

    return NextResponse.json({
      success: true,
      message: body.resetBinding
        ? 'Kunci binding bot berhasil dilepas (Reset).'
        : 'API Key berhasil diperbarui.',
      key: {
        id: apiKeyDoc._id.toString(),
        name: apiKeyDoc.name,
        key: apiKeyDoc.key,
        isSingleBot: apiKeyDoc.isSingleBot,
        boundIdentifier: apiKeyDoc.boundIdentifier,
        boundAt: apiKeyDoc.boundAt ? apiKeyDoc.boundAt.toISOString() : null,
        lastUsedAt: apiKeyDoc.lastUsedAt ? apiKeyDoc.lastUsedAt.toISOString() : null,
        lastUsedIp: apiKeyDoc.lastUsedIp,
        totalRequests: apiKeyDoc.totalRequests,
        isActive: apiKeyDoc.isActive,
        createdAt: apiKeyDoc.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal memperbarui API Key', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/apikeys/[id] - Delete an API Key
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Anda wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    const { id } = params;
    await connectToDatabase();

    const deleted = await ApiKey.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'API Key tidak ditemukan atau sudah dihapus.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `API Key "${deleted.name}" berhasil dihapus.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal menghapus API Key', details: err.message },
      { status: 500 }
    );
  }
}
