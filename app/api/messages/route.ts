import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { checkRateLimit } from '@/lib/rateLimiter';
import { hasApiKeyProvided, validateApiKeyDetailed } from '@/lib/auth';
import { checkIsVipDomain, extractDomainFromEmail, getAllDomainDetails, normalizeDomain } from '@/lib/domains';
import { recordBotLog } from '@/lib/botLogger';

export const dynamic = 'force-dynamic';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  // Public Rate Limit (120 req/minute per IP)
  const rateLimit = checkRateLimit(req, { maxRequests: 120, windowMs: 60 * 1000, keyPrefix: 'messages_get' });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests: Permintaan terlalu cepat. Silakan tunggu beberapa detik.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const emailRaw = (searchParams.get('email') || searchParams.get('address'))?.trim().toLowerCase();

    if (!emailRaw) {
      return NextResponse.json(
        { error: 'Parameter "email" is required' },
        { status: 400 }
      );
    }

    const email = emailRaw.replace(/[^a-z0-9.@_-]/g, '');

    // 0. Autentikasi API Key (Jika request membawa API Key)
    const apiKeyProvided = hasApiKeyProvided(req);
    let isApiKeyValid = false;
    let apiKeyAuthResult: any = null;

    if (apiKeyProvided) {
      apiKeyAuthResult = await validateApiKeyDetailed(req);
      if (!apiKeyAuthResult.valid) {
        try {
          recordBotLog({
            action: 'inbox',
            req,
            auth: apiKeyAuthResult,
            email: email || '',
            status: apiKeyAuthResult.status === 403 ? 'blocked' : 'error',
            statusCode: apiKeyAuthResult.status || 401,
            message: apiKeyAuthResult.error || 'Ditolak: API Key tidak valid / terikat',
            responseTimeMs: Date.now() - startTime,
          });
        } catch {}

        return NextResponse.json(
          {
            success: false,
            error: apiKeyAuthResult.error || 'Unauthorized: API Key tidak valid.',
            data: [],
            messages: [],
          },
          { status: apiKeyAuthResult.status || 401 }
        );
      }
      isApiKeyValid = true;
    }

    // 1. Validasi Global Access Gate (Bypass jika membawa API Key yang valid)
    const { getAccessSettings } = await import('@/lib/settings');
    const access = await getAccessSettings();
    if (access.enabled && !isApiKeyValid) {
      const accessToken = req.headers.get('x-access-token') || searchParams.get('access_token') || '';
      const { verifyAccessToken } = await import('@/lib/auth');
      const isAccessValid = verifyAccessToken(accessToken, access.key) || accessToken === access.key;
      if (!isAccessValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Akses ditolak. Layanan email dikunci oleh Access Gate.',
            isAccessLocked: true,
            data: [],
            messages: [],
          },
          { status: 403 }
        );
      }
    }

    // 2. Validasi Domain VIP (API Key yang valid mendapat FULL AKSES ke seluruh domain VIP)
    const { verifyVipSessionToken } = await import('@/lib/auth');
    const vipToken = req.headers.get('x-vip-token') || searchParams.get('vip_token') || '';
    const isVipTokenValid = isApiKeyValid || verifyVipSessionToken(vipToken);

    if (email.includes('@')) {
      const isVip = await checkIsVipDomain(email);
      const domainPart = extractDomainFromEmail(email);

      if (isVip && !isVipTokenValid) {
        return NextResponse.json(
          {
            success: false,
            error: `Domain @${domainPart} berstatus VIP eksklusif. Kode CDK / Passcode diperlukan untuk mengakses kotak masuk.`,
            isVipRequired: true,
            domain: domainPart,
            data: [],
            messages: [],
          },
          { status: 403 }
        );
      }
    }

    await connectToDatabase();

    // Cari pesan berdasarkan recipient dengan sanitasi aman
    let query: any = {};
    if (email.includes('@')) {
      query.recipient = email;
    } else {
      // Jika query tanpa domain (@) dan token VIP / API Key tidak ada, kecualikan domain VIP
      if (!isVipTokenValid) {
        const allDetails = await getAllDomainDetails();
        const vipDomains = allDetails.filter((d) => d.isVip).map((d) => normalizeDomain(d.domain));
        if (vipDomains.length > 0) {
          const excludePattern = vipDomains.map((d) => escapeRegex(d)).join('|');
          query.recipient = {
            $regex: new RegExp(`^${escapeRegex(email)}@(?!(${excludePattern})$)`, 'i'),
          };
        } else {
          query.recipient = { $regex: new RegExp(`^${escapeRegex(email)}@`, 'i') };
        }
      } else {
        query.recipient = { $regex: new RegExp(`^${escapeRegex(email)}@`, 'i') };
      }
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

    if (isApiKeyValid && apiKeyAuthResult) {
      try {
        recordBotLog({
          action: 'inbox',
          req,
          auth: apiKeyAuthResult,
          email,
          status: 'success',
          statusCode: 200,
          message: `Membaca inbox untuk ${email} via API (${formattedMessages.length} pesan)`,
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
  } catch (error: any) {
    console.warn('MongoDB connection note:', error.message);
    return NextResponse.json({
      success: true,
      count: 0,
      data: [],
      messages: [],
      dbStatus: 'offline_or_connecting',
    });
  }
}

export async function DELETE(req: NextRequest) {
  const startTime = Date.now();
  const rateLimit = checkRateLimit(req, { maxRequests: 30, windowMs: 60 * 1000, keyPrefix: 'messages_delete' });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests: Permintaan terlalu sering.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const emailRaw = (searchParams.get('email') || searchParams.get('address'))?.trim().toLowerCase();

    if (!emailRaw) {
      return NextResponse.json(
        { error: 'Parameter "email" is required' },
        { status: 400 }
      );
    }

    const email = emailRaw.replace(/[^a-z0-9.@_-]/g, '');

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
      const accessToken = req.headers.get('x-access-token') || searchParams.get('access_token') || '';
      const { verifyAccessToken } = await import('@/lib/auth');
      const isAccessValid = verifyAccessToken(accessToken, access.key) || accessToken === access.key;
      if (!isAccessValid) {
        return NextResponse.json(
          { error: 'Akses ditolak. Layanan email dikunci oleh Access Gate.' },
          { status: 403 }
        );
      }
    }

    // 2. Validasi Domain VIP jika email berada di domain VIP
    const { verifyVipSessionToken } = await import('@/lib/auth');
    const vipToken = req.headers.get('x-vip-token') || searchParams.get('vip_token') || '';
    const isVipTokenValid = isApiKeyValid || verifyVipSessionToken(vipToken);

    if (email.includes('@')) {
      const isVip = await checkIsVipDomain(email);
      const domainPart = extractDomainFromEmail(email);

      if (isVip && !isVipTokenValid) {
        return NextResponse.json(
          { error: `Domain @${domainPart} berstatus VIP eksklusif. Kode CDK / Passcode diperlukan.` },
          { status: 403 }
        );
      }
    }

    await connectToDatabase();

    let query: any = {};
    if (email.includes('@')) {
      query.recipient = email;
    } else {
      if (!isVipTokenValid) {
        const allDetails = await getAllDomainDetails();
        const vipDomains = allDetails.filter((d) => d.isVip).map((d) => normalizeDomain(d.domain));
        if (vipDomains.length > 0) {
          const excludePattern = vipDomains.map((d) => escapeRegex(d)).join('|');
          query.recipient = {
            $regex: new RegExp(`^${escapeRegex(email)}@(?!(${excludePattern})$)`, 'i'),
          };
        } else {
          query.recipient = { $regex: new RegExp(`^${escapeRegex(email)}@`, 'i') };
        }
      } else {
        query.recipient = { $regex: new RegExp(`^${escapeRegex(email)}@`, 'i') };
      }
    }

    const result = await Message.deleteMany(query);

    if (isApiKeyValid && apiKeyAuthResult) {
      try {
        recordBotLog({
          action: 'inbox',
          req,
          auth: apiKeyAuthResult,
          email,
          status: 'success',
          statusCode: 200,
          message: `Menghapus pesan untuk ${email} via API (${result.deletedCount} pesan)`,
          responseTimeMs: Date.now() - startTime,
        });
      } catch {}
    }

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
