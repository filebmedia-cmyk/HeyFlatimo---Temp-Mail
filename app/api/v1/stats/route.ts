import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const isValid = await validateApiKey(req);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing API Key' },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ isRead: false });

    return NextResponse.json({
      success: true,
      service: 'HeyFlatimo Developer API',
      status: 'online',
      database: 'connected',
      totalMessages: totalMessages,
      unreadMessages: unreadMessages,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      service: 'HeyFlatimo Developer API',
      status: 'online',
      database: 'offline_or_connecting',
      totalMessages: 0,
      unreadMessages: 0,
      timestamp: new Date().toISOString(),
      warning: err.message,
    });
  }
}
