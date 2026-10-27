import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { hasApiKeyProvided, validateApiKeyDetailed } from '@/lib/auth';
import { checkIsVipDomain, extractDomainFromEmail } from '@/lib/domains';
import { recordBotLog } from '@/lib/botLogger';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  try {
    const rawId = params.id;
    if (!rawId) {
      return NextResponse.json({ error: 'Message ID or Email is required' }, { status: 400 });
    }

    const decodedId = decodeURIComponent(rawId).trim().toLowerCase();

    // 0. Autentikasi API Key (jika request menyertakan API Key)
    const apiKeyProvided = hasApiKeyProvided(req);
    let isApiKeyValid = false;
    let apiKeyAuthResult: any = null;

    if (apiKeyProvided) {
      apiKeyAuthResult = await validateApiKeyDetailed(req);
      if (!apiKeyAuthResult.valid) {
        return NextResponse.json(
          { error: apiKeyAuthResult.error || 'Unauthorized: API Key tidak valid.' },
          { status: apiKeyAuthResult.status || 401 }
        );
      }
      isApiKeyValid = true;
    }

    // 1. Validasi Global Access Gate (Bypass jika request membawa API Key yang valid)
    const { getAccessSettings } = await import('@/lib/settings');
    const access = await getAccessSettings();
    if (access.enabled && !isApiKeyValid) {
      const accessToken = req.headers.get('x-access-token') || new URL(req.url).searchParams.get('access_token') || '';
      const { verifyAccessToken } = await import('@/lib/auth');
      const isAccessValid = verifyAccessToken(accessToken, access.key) || accessToken === access.key;
      if (!isAccessValid) {
        return NextResponse.json(
          { error: 'Akses ditolak. Layanan email dikunci oleh Access Gate.' },
          { status: 403 }
        );
      }
    }

    await connectToDatabase();

    // KASUS A: Jika parameter adalah alamat email (mengandung '@')
    if (decodedId.includes('@')) {
      const isVip = await checkIsVipDomain(decodedId);
      const domainPart = extractDomainFromEmail(decodedId);

      const vipToken = req.headers.get('x-vip-token') || new URL(req.url).searchParams.get('vip_token') || '';
      const { verifyVipSessionToken } = await import('@/lib/auth');
      const isVipValid = isApiKeyValid || verifyVipSessionToken(vipToken);

      if (isVip && !isVipValid) {
        return NextResponse.json(
          {
            success: false,
            error: `Domain @${domainPart} berstatus VIP eksklusif. Kode CDK / Passcode diperlukan.`,
            isVipRequired: true,
            data: [],
            messages: [],
          },
          { status: 403 }
        );
      }

      const messages = await Message.find({ recipient: decodedId })
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

      if (isApiKeyValid && apiKeyAuthResult) {
        try {
          recordBotLog({
            action: 'inbox',
            req,
            auth: apiKeyAuthResult,
            email: decodedId,
            status: 'success',
            statusCode: 200,
            message: `Membaca pesan untuk ${decodedId} via path API (${formattedMessages.length} pesan)`,
            responseTimeMs: Date.now() - startTime,
          });
        } catch {}
      }

      return NextResponse.json({
        success: true,
        count: formattedMessages.length,
        data: formattedMessages,
        messages: formattedMessages,
      });
    }

    // KASUS B: Parameter adalah Message ObjectId
    if (!mongoose.Types.ObjectId.isValid(decodedId)) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const existingMsg = await Message.findById(decodedId).lean();
    if (!existingMsg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // 2. Validasi Domain VIP jika pesan ditujukan ke domain VIP
    const recipient = (existingMsg as any).recipient || '';
    const isVip = await checkIsVipDomain(recipient);
    const domainPart = extractDomainFromEmail(recipient);

    if (isVip) {
      const vipToken = req.headers.get('x-vip-token') || new URL(req.url).searchParams.get('vip_token') || '';
      const { verifyVipSessionToken } = await import('@/lib/auth');
      const isVipValid = isApiKeyValid || verifyVipSessionToken(vipToken);

      if (!isVipValid) {
        return NextResponse.json(
          { error: `Pesan ini milik domain VIP @${domainPart}. Kode CDK / Passcode diperlukan.` },
          { status: 403 }
        );
      }
    }

    // Temukan dan update status isRead menjadi true
    const message = await Message.findByIdAndUpdate(
      decodedId,
      { $set: { isRead: true } },
      { new: true }
    ).lean();

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
    console.error('Error fetching message:', error);
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
    const rawId = params.id;
    if (!rawId) {
      return NextResponse.json({ error: 'Message ID or Email is required' }, { status: 400 });
    }

    const decodedId = decodeURIComponent(rawId).trim().toLowerCase();

    // 0. Autentikasi API Key
    const apiKeyProvided = hasApiKeyProvided(req);
    let isApiKeyValid = false;
    let apiKeyAuthResult: any = null;

    if (apiKeyProvided) {
      apiKeyAuthResult = await validateApiKeyDetailed(req);
      if (!apiKeyAuthResult.valid) {
        return NextResponse.json(
          { error: apiKeyAuthResult.error || 'Unauthorized: API Key tidak valid.' },
          { status: apiKeyAuthResult.status || 401 }
        );
      }
      isApiKeyValid = true;
    }

    // 1. Validasi Global Access Gate
    const { getAccessSettings } = await import('@/lib/settings');
    const access = await getAccessSettings();
    if (access.enabled && !isApiKeyValid) {
      const accessToken = req.headers.get('x-access-token') || new URL(req.url).searchParams.get('access_token') || '';
      const { verifyAccessToken } = await import('@/lib/auth');
      const isAccessValid = verifyAccessToken(accessToken, access.key) || accessToken === access.key;
      if (!isAccessValid) {
        return NextResponse.json(
          { error: 'Akses ditolak. Layanan email dikunci oleh Access Gate.' },
          { status: 403 }
        );
      }
    }

    await connectToDatabase();

    // KASUS A: Jika parameter adalah alamat email -> hapus semua pesan email tersebut
    if (decodedId.includes('@')) {
      const isVip = await checkIsVipDomain(decodedId);
      const domainPart = extractDomainFromEmail(decodedId);

      const vipToken = req.headers.get('x-vip-token') || new URL(req.url).searchParams.get('vip_token') || '';
      const { verifyVipSessionToken } = await import('@/lib/auth');
      const isVipValid = isApiKeyValid || verifyVipSessionToken(vipToken);

      if (isVip && !isVipValid) {
        return NextResponse.json(
          { error: `Domain @${domainPart} berstatus VIP eksklusif. Kode CDK / Passcode diperlukan.` },
          { status: 403 }
        );
      }

      const delResult = await Message.deleteMany({ recipient: decodedId });
      return NextResponse.json({
        success: true,
        message: `Deleted ${delResult.deletedCount} messages`,
        deletedCount: delResult.deletedCount,
      });
    }

    // KASUS B: Parameter adalah Message ObjectId tunggal
    if (!mongoose.Types.ObjectId.isValid(decodedId)) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const existingMsg = await Message.findById(decodedId).lean();
    if (!existingMsg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // 2. Validasi Domain VIP jika pesan berada di domain VIP
    const recipient = (existingMsg as any).recipient || '';
    const isVip = await checkIsVipDomain(recipient);
    const domainPart = extractDomainFromEmail(recipient);

    if (isVip) {
      const vipToken = req.headers.get('x-vip-token') || new URL(req.url).searchParams.get('vip_token') || '';
      const { verifyVipSessionToken } = await import('@/lib/auth');
      const isVipValid = isApiKeyValid || verifyVipSessionToken(vipToken);

      if (!isVipValid) {
        return NextResponse.json(
          { error: `Pesan ini milik domain VIP @${domainPart}. Kode CDK / Passcode diperlukan.` },
          { status: 403 }
        );
      }
    }

    const result = await Message.findByIdAndDelete(decodedId);
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
