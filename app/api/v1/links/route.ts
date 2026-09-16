import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyDetailed } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { findLatestMessageMultiCluster } from '@/lib/models/Message';
import { extractLinks } from '@/lib/otpParser';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized: Invalid or missing API Key' },
      { status: auth.status || 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: 'Parameter "email" is required' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const latestMessage: any = await findLatestMessageMultiCluster(email);

    if (!latestMessage) {
      return NextResponse.json({
        success: true,
        found: false,
        email: email,
        primaryLink: null,
        allLinks: [],
        message: 'Belum ada email masuk untuk alamat ini.',
      });
    }

    const linksResult = extractLinks(
      latestMessage.bodyText || '',
      latestMessage.bodyHtml || ''
    );

    return NextResponse.json({
      success: true,
      found: linksResult.found,
      email: email,
      primaryLink: linksResult.primaryLink,
      allLinks: linksResult.allLinks,
      subject: latestMessage.subject,
      sender: latestMessage.sender,
      receivedAt: latestMessage.createdAt,
      messageId: latestMessage._id ? latestMessage._id.toString() : latestMessage.id,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      found: false,
      email: email,
      primaryLink: null,
      allLinks: [],
      message: 'Belum ada email masuk atau koneksi database offline',
      warning: err.message,
    });
  }
}
