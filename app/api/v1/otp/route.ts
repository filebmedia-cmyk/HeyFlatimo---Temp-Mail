import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { extractOtp } from '@/lib/otpParser';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const isValid = await validateApiKey(req);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing API Key' },
      { status: 401 }
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

    let query: any = {};
    if (email.includes('@')) {
      query.recipient = email;
    } else {
      query.recipient = { $regex: new RegExp(`^${email}@`, 'i') };
    }

    // Ambil pesan terbaru
    const latestMessage: any = await Message.findOne(query)
      .sort({ createdAt: -1 })
      .lean();

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
      messageId: latestMessage._id.toString(),
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
