import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: 'Parameter "email" is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Cari pesan berdasarkan recipient
    let query: any = {};
    if (email.includes('@')) {
      query.recipient = email;
    } else {
      // Jika user hanya memasukkan prefix tanpa domain, cari semua email dengan prefix tersebut
      query.recipient = { $regex: new RegExp(`^${email}@`, 'i') };
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
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: 'Parameter "email" is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let query: any = {};
    if (email.includes('@')) {
      query.recipient = email;
    } else {
      query.recipient = { $regex: new RegExp(`^${email}@`, 'i') };
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
