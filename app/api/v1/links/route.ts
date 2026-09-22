import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyDetailed } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { extractLinks } from '@/lib/otpParser';
import { recordBotLog } from '@/lib/botLogger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
    recordBotLog({
      action: 'links',
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

  const { searchParams } = new URL(req.url);
  const emailRaw = searchParams.get('email')?.trim().toLowerCase();

  if (!emailRaw) {
    recordBotLog({
      action: 'links',
      req,
      auth,
      status: 'error',
      statusCode: 400,
      message: 'Parameter "email" kosong',
      responseTimeMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Parameter "email" is required' },
      { status: 400 }
    );
  }

  const email = emailRaw.replace(/[^a-z0-9.@_-]/g, '');

  try {
    await connectToDatabase();

    let query: any = {};
    if (email.includes('@')) {
      query.recipient = email;
    } else {
      query.recipient = { $regex: new RegExp(`^${email}@`, 'i') };
    }

    const latestMessage: any = await Message.findOne(query)
      .sort({ createdAt: -1 })
      .lean();

    const responseTimeMs = Date.now() - startTime;

    if (!latestMessage) {
      recordBotLog({
        action: 'links',
        req,
        auth,
        email,
        link: null,
        status: 'waiting',
        statusCode: 200,
        message: `Menunggu email masuk untuk ${email}`,
        responseTimeMs,
      });

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

    recordBotLog({
      action: 'links',
      req,
      auth,
      email,
      link: linksResult.found ? linksResult.primaryLink : null,
      status: linksResult.found ? 'success' : 'waiting',
      statusCode: 200,
      message: linksResult.found
        ? `Link Ditemukan: ${linksResult.primaryLink}`
        : `Email ada tapi tautan belum terdeteksi (${latestMessage.subject || 'No Subject'})`,
      responseTimeMs,
    });

    return NextResponse.json({
      success: true,
      found: linksResult.found,
      email: email,
      primaryLink: linksResult.primaryLink,
      allLinks: linksResult.allLinks,
      subject: latestMessage.subject,
      sender: latestMessage.sender,
      receivedAt: latestMessage.createdAt,
      messageId: latestMessage._id.toString(),
    });
  } catch (err: any) {
    const responseTimeMs = Date.now() - startTime;
    recordBotLog({
      action: 'links',
      req,
      auth,
      email,
      status: 'error',
      statusCode: 500,
      message: `Error query database: ${err.message}`,
      responseTimeMs,
    });

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
