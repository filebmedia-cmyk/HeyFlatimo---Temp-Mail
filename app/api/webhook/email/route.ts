import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';

export async function POST(req: NextRequest) {
  try {
    // 1. Validasi Keamanan Secret Webhook jika diset di .env
    const secretExpected = process.env.WEBHOOK_SECRET;
    if (secretExpected) {
      const secretHeader = req.headers.get('x-webhook-secret');
      const authHeader = req.headers.get('authorization');
      const urlSecret = req.nextUrl.searchParams.get('secret');

      const isSecretValid =
        secretHeader === secretExpected ||
        authHeader === `Bearer ${secretExpected}` ||
        urlSecret === secretExpected;

      if (!isSecretValid) {
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

    const cleanSender = from || payloadSender || 'Unknown Sender';
    const finalSubject = subject || '(Tanpa Subjek)';
    const finalBodyText = text || bodyText || '';
    const finalBodyHtml = html || bodyHtml || '';

    // Hitung waktu kadaluarsa TTL (default 24 jam)
    const ttlHours = parseInt(process.env.EMAIL_TTL_HOURS || '24', 10);
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

    return NextResponse.json({
      success: true,
      message: 'Email successfully received and saved',
      data: {
        id: newMessage._id,
        recipient: newMessage.recipient,
        subject: newMessage.subject,
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
