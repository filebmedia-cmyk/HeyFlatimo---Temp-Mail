import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyDetailed } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { recordBotLog } from '@/lib/botLogger';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
    recordBotLog({
      action: 'message_detail',
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

  const { id } = params;

  try {
    await connectToDatabase();

    const message: any = await Message.findByIdAndUpdate(
      id,
      { $set: { isRead: true } },
      { new: true }
    ).lean();

    const responseTimeMs = Date.now() - startTime;

    if (!message) {
      recordBotLog({
        action: 'message_detail',
        req,
        auth,
        status: 'error',
        statusCode: 404,
        message: `Pesan ID ${id} tidak ditemukan`,
        responseTimeMs,
      });

      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    recordBotLog({
      action: 'message_detail',
      req,
      auth,
      email: message.recipient,
      status: 'success',
      statusCode: 200,
      message: `Membaca pesan dari ${message.sender} (Subjek: ${message.subject || 'No Subject'})`,
      responseTimeMs,
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message._id.toString(),
        recipient: message.recipient,
        sender: message.sender,
        senderName: message.senderName,
        senderAddress: message.senderAddress,
        subject: message.subject,
        bodyText: message.bodyText,
        bodyHtml: message.bodyHtml,
        headers: message.headers,
        attachments: message.attachments || [],
        isRead: message.isRead,
        createdAt: message.createdAt,
        expiresAt: message.expiresAt,
      },
    });
  } catch (err: any) {
    const responseTimeMs = Date.now() - startTime;
    recordBotLog({
      action: 'message_detail',
      req,
      auth,
      status: 'error',
      statusCode: 500,
      message: `Error detail pesan: ${err.message}`,
      responseTimeMs,
    });

    return NextResponse.json(
      { error: 'Gagal mengambil pesan', details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { id } = params;

  try {
    await connectToDatabase();

    const result = await Message.findByIdAndDelete(id);
    const responseTimeMs = Date.now() - startTime;

    if (!result) {
      recordBotLog({
        action: 'delete_inbox',
        req,
        auth,
        status: 'error',
        statusCode: 404,
        message: `Gagal menghapus: Pesan ID ${id} tidak ditemukan`,
        responseTimeMs,
      });

      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    recordBotLog({
      action: 'delete_inbox',
      req,
      auth,
      email: (result as any).recipient,
      status: 'success',
      statusCode: 200,
      message: `Pesan ID ${id} berhasil dihapus`,
      responseTimeMs,
    });

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dihapus',
    });
  } catch (err: any) {
    const responseTimeMs = Date.now() - startTime;
    recordBotLog({
      action: 'delete_inbox',
      req,
      auth,
      status: 'error',
      statusCode: 500,
      message: `Error hapus pesan: ${err.message}`,
      responseTimeMs,
    });

    return NextResponse.json(
      { error: 'Gagal menghapus pesan', details: err.message },
      { status: 500 }
    );
  }
}
