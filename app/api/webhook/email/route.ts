import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { safeCompare } from '@/lib/auth';
import { recordBotLog } from '@/lib/botLogger';
import { extractOtp, extractLinks } from '@/lib/otpParser';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    // 1. Validasi Keamanan Secret Webhook jika diset di .env (Constant-Time Compare)
    const secretExpected = process.env.WEBHOOK_SECRET;
    if (secretExpected) {
      const secretHeader = req.headers.get('x-webhook-secret') || '';
      const authHeader = req.headers.get('authorization') || '';
      const urlSecret = req.nextUrl.searchParams.get('secret') || '';

      const isSecretValid =
        safeCompare(secretHeader, secretExpected) ||
        safeCompare(authHeader, `Bearer ${secretExpected}`) ||
        safeCompare(urlSecret, secretExpected);

      if (!isSecretValid) {
        recordBotLog({
          action: 'email_in',
          req,
          keyName: 'Webhook Unauthorized',
          status: 'blocked',
          statusCode: 401,
          message: 'Ditolak: Secret Webhook tidak cocok',
          responseTimeMs: Date.now() - startTime,
        });

        return NextResponse.json(
          { error: 'Unauthorized: Invalid or missing webhook secret token' },
          { status: 401 }
        );
      }
    }

    // 2. Baca Payload JSON dari Cloudflare Worker
    const payload = await req.json();

    const {
      to,
      recipient: payloadRecipient,
      from,
      sender: payloadSender,
      senderAddress,
      senderName,
      subject,
      text,
      html,
      bodyText,
      bodyHtml,
      headers,
      attachments,
      rawSize,
    } = payload;

    // Normalisasi alamat penerima
    const recipientRaw = to || payloadRecipient;
    if (!recipientRaw) {
      return NextResponse.json(
        { error: 'Bad Request: "to" or "recipient" field is required' },
        { status: 400 }
      );
    }

    // Ekstrak email jika bentuknya "Name <user@domain.com>"
    let cleanRecipient = recipientRaw;
    if (typeof recipientRaw === 'string') {
      const match = recipientRaw.match(/<([^>]+)>/);
      cleanRecipient = (match ? match[1] : recipientRaw).trim().toLowerCase();
    } else if (Array.isArray(recipientRaw) && recipientRaw.length > 0) {
      const first = recipientRaw[0];
      const match = typeof first === 'string' ? first.match(/<([^>]+)>/) : null;
      cleanRecipient = (match ? match[1] : (first?.address || first)).trim().toLowerCase();
    }

    const { decodeQuotedPrintable } = await import('@/lib/formatters');
    const cleanSender = from || payloadSender || 'Unknown Sender';
    const finalSubject = decodeQuotedPrintable(subject || '(Tanpa Subjek)');
    const finalBodyText = decodeQuotedPrintable(text || bodyText || '');
    const finalBodyHtml = decodeQuotedPrintable(html || bodyHtml || '');

    // Ekstrak OTP dan Link otomatis
    const otpResult = extractOtp(finalBodyText, finalBodyHtml, finalSubject);
    const linksResult = extractLinks(finalBodyText, finalBodyHtml);

    // Hitung waktu kadaluarsa TTL (Default 72 jam / 3 hari standar WIB)
    const { getRetentionSettings } = await import('@/lib/settings');
    const retention = await getRetentionSettings();
    const ttlHours = retention.retentionHours > 0 ? retention.retentionHours : 72;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    // 3. Simpan ke MongoDB
    await connectToDatabase();

    const newMessage = await Message.create({
      recipient: cleanRecipient,
      sender: cleanSender,
      senderAddress: senderAddress || cleanSender,
      senderName: senderName || '',
      subject: finalSubject,
      bodyText: finalBodyText,
      bodyHtml: finalBodyHtml,
      rawSize: rawSize || (finalBodyHtml.length + finalBodyText.length),
      headers: headers || {},
      attachments: Array.isArray(attachments) ? attachments : [],
      isRead: false,
      createdAt: new Date(),
      expiresAt: expiresAt,
    });

    // Catat ke statistik seumur hidup (lifetime stats)
    const { recordIncomingEmail } = await import('@/lib/stats');
    await recordIncomingEmail(1).catch(() => null);

    const responseTimeMs = Date.now() - startTime;

    // Catat ke Live Terminal Log!
    recordBotLog({
      action: 'email_in',
      req,
      email: cleanRecipient,
      keyName: 'Incoming Mail Server',
      ip: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || '127.0.0.1',
      otp: otpResult.found ? otpResult.otp : null,
      link: linksResult.found ? linksResult.primaryLink : null,
      status: 'success',
      statusCode: 200,
      message: `Pesan masuk dari ${cleanSender} (${finalSubject})`,
      responseTimeMs,
    });

    return NextResponse.json({
      success: true,
      message: 'Email successfully received and saved',
      data: {
        id: newMessage._id,
        recipient: newMessage.recipient,
        subject: newMessage.subject,
        otp: otpResult.found ? otpResult.otp : null,
        primaryLink: linksResult.found ? linksResult.primaryLink : null,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error processing incoming email webhook:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
