import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyDetailed } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { recordBotLog } from '@/lib/botLogger';

export const dynamic = 'force-dynamic';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
    recordBotLog({
      action: 'inbox',
      req,
      auth,
      status: auth.status === 403 ? 'blocked' : 'error',
      statusCode: auth.status || 401,
      message: auth.error || 'Ditolak: API Key tidak valid / terikat',
      responseTimeMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: auth.error || 'Unauthorized: Invalid or missing API Key' },
      { status: auth.status || 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const emailRaw = searchParams.get('email')?.trim().toLowerCase();

  if (!emailRaw) {
    recordBotLog({
      action: 'inbox',
      req,
      auth,
      status: 'error',
      statusCode: 400,
      message: 'Parameter "email" kosong',
      responseTimeMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Parameter "email" is required' },
      { status: 400 }
    );
  }

  const email = emailRaw.replace(/[^a-z0-9.@_-]/g, '');

  try {
    await connectToDatabase();

    let query: any = {};
    if (email.includes('@')) {
      query.recipient = email;
    } else {
      query.recipient = { $regex: new RegExp(`^${escapeRegex(email)}@`, 'i') };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const formatted = messages.map((m: any) => ({
      id: m._id.toString(),
      recipient: m.recipient,
      sender: m.sender,
      senderName: m.senderName,
      senderAddress: m.senderAddress,
      subject: m.subject || '(Tanpa Subjek)',
      bodyText: m.bodyText,
      bodyHtml: m.bodyHtml,
      isRead: m.isRead,
      createdAt: m.createdAt,
      expiresAt: m.expiresAt,
      attachmentsCount: (m.attachments || []).length,
    }));

    const responseTimeMs = Date.now() - startTime;
    recordBotLog({
      action: 'inbox',
      req,
      auth,
      email,
      status: 'success',
      statusCode: 200,
      message: `Membaca ${formatted.length} pesan inbox untuk ${email}`,
      responseTimeMs,
    });

    return NextResponse.json({
      success: true,
      email: email,
      count: formatted.length,
      messages: formatted,
    });
  } catch (err: any) {
    const responseTimeMs = Date.now() - startTime;
    recordBotLog({
      action: 'inbox',
      req,
      auth,
      email,
      status: 'error',
      statusCode: 500,
      message: `Error query database: ${err.message}`,
      responseTimeMs,
    });

    return NextResponse.json({
      success: true,
      email: email,
      count: 0,
      messages: [],
      warning: err.message,
    });
  }
}

export async function DELETE(req: NextRequest) {
  const startTime = Date.now();
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
    recordBotLog({
      action: 'delete_inbox',
      req,
      auth,
      status: auth.status === 403 ? 'blocked' : 'error',
      statusCode: auth.status || 401,
      message: auth.error || 'Ditolak: API Key tidak valid / terikat',
      responseTimeMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: auth.error || 'Unauthorized: Invalid or missing API Key' },
      { status: auth.status || 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const emailRaw = searchParams.get('email')?.trim().toLowerCase();

  if (!emailRaw) {
    recordBotLog({
      action: 'delete_inbox',
      req,
      auth,
      status: 'error',
      statusCode: 400,
      message: 'Parameter "email" kosong',
      responseTimeMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Parameter "email" is required' },
      { status: 400 }
    );
  }

  const email = emailRaw.replace(/[^a-z0-9.@_-]/g, '');

  try {
    await connectToDatabase();

    let query: any = {};
    if (email.includes('@')) {
      query.recipient = email;
    } else {
      query.recipient = { $regex: new RegExp(`^${escapeRegex(email)}@`, 'i') };
    }

    const result = await Message.deleteMany(query);
    const deletedCount = result.deletedCount || 0;
    if (deletedCount > 0) {
      const { recordDeletedEmails } = await import('@/lib/stats');
      await recordDeletedEmails(deletedCount).catch(() => null);
    }

    const responseTimeMs = Date.now() - startTime;
    recordBotLog({
      action: 'delete_inbox',
      req,
      auth,
      email,
      status: 'success',
      statusCode: 200,
      message: `Menghapus ${deletedCount} pesan inbox untuk ${email}`,
      responseTimeMs,
    });

    return NextResponse.json({
      success: true,
      email: email,
      deletedCount: deletedCount,
      message: `Berhasil menghapus ${deletedCount} pesan`,
    });
  } catch (err: any) {
    const responseTimeMs = Date.now() - startTime;
    recordBotLog({
      action: 'delete_inbox',
      req,
      auth,
      email,
      status: 'error',
      statusCode: 500,
      message: `Error delete database: ${err.message}`,
      responseTimeMs,
    });

    return NextResponse.json(
      { error: 'Gagal menghapus pesan', details: err.message },
      { status: 500 }
    );
  }
}
