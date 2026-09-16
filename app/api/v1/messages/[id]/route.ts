import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyDetailed } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
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

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

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
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized: Invalid or missing API Key' },
      { status: auth.status || 401 }
    );
  }

  const { id } = params;

  try {
    await connectToDatabase();

    const result = await Message.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dihapus',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal menghapus pesan', details: err.message },
      { status: 500 }
    );
  }
}
