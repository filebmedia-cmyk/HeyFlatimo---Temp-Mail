import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyDetailed } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import {
  findMessagesMultiCluster,
  deleteMessagesMultiCluster,
} from '@/lib/models/Message';

export const dynamic = 'force-dynamic';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized: Invalid or missing API Key' },
      { status: auth.status || 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const emailRaw = searchParams.get('email')?.trim().toLowerCase();

  if (!emailRaw) {
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

    const messages = await findMessagesMultiCluster(query, {
      sort: { createdAt: -1 },
      limit: 100,
    });

    const formatted = messages.map((m: any) => ({
      id: m._id ? m._id.toString() : m.id,
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

    return NextResponse.json({
      success: true,
      email: email,
      count: formatted.length,
      messages: formatted,
    });
  } catch (err: any) {
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
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized: Invalid or missing API Key' },
      { status: auth.status || 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const emailRaw = searchParams.get('email')?.trim().toLowerCase();

  if (!emailRaw) {
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

    const deletedCount = await deleteMessagesMultiCluster(query);
    if (deletedCount > 0) {
      const { recordDeletedEmails } = await import('@/lib/stats');
      await recordDeletedEmails(deletedCount).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      email: email,
      deletedCount: deletedCount,
      message: `Berhasil menghapus ${deletedCount} pesan`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal menghapus pesan', details: err.message },
      { status: 500 }
    );
  }
}
