import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { safeCompare } from '@/lib/auth';

export async function POST(req: NextRequest) {
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

    // Hitung waktu kadaluarsa TTL (Default 72 jam / 3 hari standar WIB)
    const { getRetentionSettings } = await import('@/lib/settings');
    const retention = await getRetentionSettings();
    const ttlHours = retention.retentionHours > 0 ? retention.retentionHours : 72;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    // 3. Simpan ke MongoDB dengan multi-cluster failover
    await connectToDatabase();
    const { saveIncomingMessageMultiCluster } = await import('@/lib/models/Message');

    const saveResult = await saveIncomingMessageMultiCluster({
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

    const newMessage = saveResult.doc;

    // Catat ke statistik seumur hidup (lifetime stats)
    const { recordIncomingEmail } = await import('@/lib/stats');
    await recordIncomingEmail(1).catch(() => null);

    return NextResponse.json({
      success: true,
      message: `Email successfully received and saved to ${saveResult.clusterName || 'MongoDB'}`,
      data: {
        id: newMessage._id || newMessage.id,
        recipient: newMessage.recipient,
        subject: newMessage.subject,
        createdAt: newMessage.createdAt,
        clusterId: saveResult.clusterId,
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
