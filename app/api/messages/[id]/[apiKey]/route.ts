import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { validateApiKeyDetailed } from '@/lib/auth';
import { recordBotLog } from '@/lib/botLogger';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; apiKey: string } }
) {
  const startTime = Date.now();
  try {
    const rawEmail = params.id;
    const rawApiKey = params.apiKey;

    if (!rawEmail || !rawApiKey) {
      return NextResponse.json(
        { error: 'Email and API Key are required in path' },
        { status: 400 }
      );
    }

    const email = decodeURIComponent(rawEmail).trim().toLowerCase().replace(/[^a-z0-9.@_-]/g, '');
    const apiKey = decodeURIComponent(rawApiKey).trim();

    // Validasi API Key
    const auth = await validateApiKeyDetailed(req, apiKey);
    if (!auth.valid) {
      try {
        recordBotLog({
          action: 'inbox',
          req,
          auth,
          email,
          status: auth.status === 403 ? 'blocked' : 'error',
          statusCode: auth.status || 401,
          message: auth.error || 'Ditolak: API Key tidak valid / terikat',
          responseTimeMs: Date.now() - startTime,
        });
      } catch {}

      return NextResponse.json(
        { error: auth.error || 'Unauthorized: Invalid API Key' },
        { status: auth.status || 401 }
      );
    }

    await connectToDatabase();

    const messages = await Message.find({ recipient: email })
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

    try {
      recordBotLog({
        action: 'inbox',
        req,
        auth,
        email,
        status: 'success',
        statusCode: 200,
        message: `Membaca pesan untuk ${email} via Tmail Classic API (${formattedMessages.length} pesan)`,
        responseTimeMs: Date.now() - startTime,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      count: formattedMessages.length,
      data: formattedMessages,
      messages: formattedMessages,
    });
  } catch (error: any) {
    console.error('Error fetching messages via classic endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; apiKey: string } }
) {
  try {
    const rawEmail = params.id;
    const rawApiKey = params.apiKey;

    if (!rawEmail || !rawApiKey) {
      return NextResponse.json(
        { error: 'Email and API Key are required in path' },
        { status: 400 }
      );
    }

    const email = decodeURIComponent(rawEmail).trim().toLowerCase().replace(/[^a-z0-9.@_-]/g, '');
    const apiKey = decodeURIComponent(rawApiKey).trim();

    const auth = await validateApiKeyDetailed(req, apiKey);
    if (!auth.valid) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized: Invalid API Key' },
        { status: auth.status || 401 }
      );
    }

    await connectToDatabase();

    const result = await Message.deleteMany({ recipient: email });
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} messages`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('Error deleting messages via classic endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to delete messages', details: error.message },
      { status: 500 }
    );
  }
}
