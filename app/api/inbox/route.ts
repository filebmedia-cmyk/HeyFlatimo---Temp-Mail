import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { hasApiKeyProvided, validateApiKeyDetailed } from '@/lib/auth';
import { checkIsVipDomain, extractDomainFromEmail } from '@/lib/domains';
import { extractOtp, extractLinks } from '@/lib/otpParser';
import { recordBotLog } from '@/lib/botLogger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const emailRaw = (searchParams.get('email') || searchParams.get('address'))?.trim().toLowerCase();

    if (!emailRaw) {
      return NextResponse.json(
        { error: 'Parameter "email" or "address" is required' },
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

    // 1. Validasi VIP jika bukan request API Key yang valid
    const isVip = await checkIsVipDomain(email);
    const domainPart = extractDomainFromEmail(email);
    if (isVip && !isApiKeyValid) {
      const vipToken = req.headers.get('x-vip-token') || searchParams.get('vip_token') || '';
      const { verifyVipSessionToken } = await import('@/lib/auth');
      const isVipValid = verifyVipSessionToken(vipToken);
      if (!isVipValid) {
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
    }

    await connectToDatabase();

    const messages = await Message.find({ recipient: email })
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

    let foundOtp: string | null = null;
    let foundLink: string | null = null;
    if (formattedMessages.length > 0) {
      const latest = formattedMessages[0];
      const otpRes = extractOtp(latest.bodyText || '', latest.bodyHtml || '', latest.subject || '');
      if (otpRes.found) foundOtp = otpRes.otp;
      const linkRes = extractLinks(latest.bodyText || '', latest.bodyHtml || '');
      if (linkRes.found) foundLink = linkRes.primaryLink;
    }

    if (isApiKeyValid && apiKeyAuthResult) {
      try {
        recordBotLog({
          action: 'inbox',
          req,
          auth: apiKeyAuthResult,
          email,
          otp: foundOtp,
          link: foundLink,
          status: 'success',
          statusCode: 200,
          message: `Membaca inbox untuk ${email} (${formattedMessages.length} pesan)`,
          responseTimeMs: Date.now() - startTime,
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      email,
      count: formattedMessages.length,
      data: formattedMessages,
      messages: formattedMessages,
      otp: foundOtp,
      link: foundLink,
    });
  } catch (error: any) {
    console.error('Error in /api/inbox:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inbox', details: error.message },
      { status: 500 }
    );
  }
}
