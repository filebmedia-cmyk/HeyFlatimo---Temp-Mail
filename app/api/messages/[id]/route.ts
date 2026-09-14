import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Temukan dan update status isRead menjadi true
    const message = await Message.findByIdAndUpdate(
      id,
      { $set: { isRead: true } },
      { new: true }
    ).lean();

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const formattedMessage = {
      id: (message as any)._id.toString(),
      recipient: (message as any).recipient,
      sender: (message as any).sender,
      senderName: (message as any).senderName,
      senderAddress: (message as any).senderAddress,
      subject: (message as any).subject,
      bodyHtml: (message as any).bodyHtml,
      bodyText: (message as any).bodyText,
      headers: (message as any).headers,
      attachments: (message as any).attachments || [],
      isRead: (message as any).isRead,
      createdAt: (message as any).createdAt,
      expiresAt: (message as any).expiresAt,
    };

    return NextResponse.json({
      success: true,
      data: formattedMessage,
    });
  } catch (error: any) {
    console.error('Error fetching single message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message details', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const result = await Message.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message', details: error.message },
      { status: 500 }
    );
  }
}
