import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { checkRateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  // Public Rate Limit (120 req/minute per IP)
  const rateLimit = checkRateLimit(req, { maxRequests: 120, windowMs: 60 * 1000, keyPrefix: 'messages_get' });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests: Permintaan terlalu cepat. Silakan tunggu beberapa detik.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const emailRaw = searchParams.get('email')?.trim().toLowerCase();

    if (!emailRaw) {
      return NextResponse.json(
        { error: 'Parameter "email" is required' },
        { status: 400 }
      );
    }

    const email = emailRaw.replace(/[^a-z0-9.@_-]/g, '');

    await connectToDatabase();

    // Cari pesan berdasarkan recipient dengan sanitasi aman
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

    const formattedMessages = messages.map((m: any) => ({
      id: m._id.toString(),
      recipient: m.recipient,
      sender: m.sender,
      senderName: m.senderName,
      senderAddress: m.senderAddress,
      subject: m.subject || '(Tanpa Subjek)',
      bodyHtml: m.bodyHtml,
      bodyText: m.bodyText,
      isRead: m.isRead,
      createdAt: m.createdAt,
      expiresAt: m.expiresAt,
      attachments: m.attachments || [],
    }));

    return NextResponse.json({
      success: true,
      count: formattedMessages.length,
      data: formattedMessages,
    });
  } catch (error: any) {
    console.warn('MongoDB connection note:', error.message);
    return NextResponse.json({
      success: true,
      count: 0,
      data: [],
      dbStatus: 'offline_or_connecting',
    });
  }
}

export async function DELETE(req: NextRequest) {
  const rateLimit = checkRateLimit(req, { maxRequests: 30, windowMs: 60 * 1000, keyPrefix: 'messages_delete' });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests: Permintaan terlalu sering.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const emailRaw = searchParams.get('email')?.trim().toLowerCase();

    if (!emailRaw) {
      return NextResponse.json(
        { error: 'Parameter "email" is required' },
        { status: 400 }
      );
    }

    const email = emailRaw.replace(/[^a-z0-9.@_-]/g, '');

    await connectToDatabase();

    let query: any = {};
    if (email.includes('@')) {
      query.recipient = email;
    } else {
      query.recipient = { $regex: new RegExp(`^${escapeRegex(email)}@`, 'i') };
    }

    const result = await Message.deleteMany(query);

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} messages`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('Error deleting messages:', error);
    return NextResponse.json(
      { error: 'Failed to delete messages', details: error.message },
      { status: 500 }
    );
  }
}
