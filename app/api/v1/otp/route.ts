import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyDetailed } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { findLatestMessageMultiCluster } from '@/lib/models/Message';
import { extractOtp } from '@/lib/otpParser';

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

    // Ambil pesan terbaru dari seluruh cluster database
    const latestMessage: any = await findLatestMessageMultiCluster(email);

    if (!latestMessage) {
      return NextResponse.json({
        success: true,
        found: false,
        email: email,
        otp: null,
        message: 'Belum ada email masuk untuk alamat ini.',
      });
    }

    const otpResult = extractOtp(
      latestMessage.bodyText || '',
      latestMessage.bodyHtml || '',
      latestMessage.subject || ''
    );

    return NextResponse.json({
      success: true,
      found: otpResult.found,
      email: email,
      otp: otpResult.otp,
      allCandidates: otpResult.allCandidates,
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
      otp: null,
      message: 'Belum ada email masuk atau koneksi database offline',
      warning: err.message,
    });
  }
}
