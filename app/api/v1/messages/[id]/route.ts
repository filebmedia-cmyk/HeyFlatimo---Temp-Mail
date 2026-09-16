import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyDetailed } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import {
  findMessageByIdMultiCluster,
  deleteMessageByIdMultiCluster,
} from '@/lib/models/Message';

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

    const message: any = await findMessageByIdMultiCluster(id, { isRead: true });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message._id ? message._id.toString() : message.id,
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

    const deleted = await deleteMessageByIdMultiCluster(id);

    if (!deleted) {
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
