import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // 1. Validasi Global Access Gate
    const { getAccessSettings } = await import('@/lib/settings');
    const access = await getAccessSettings();
    if (access.enabled) {
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

    const existingMsg = await Message.findById(id).lean();
    if (!existingMsg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // 2. Validasi Domain VIP jika pesan ditujukan ke domain VIP
    const recipient = (existingMsg as any).recipient || '';
    const domainPart = recipient.includes('@') ? recipient.split('@')[1]?.toLowerCase() : '';
    if (domainPart) {
      const { getAllDomainDetails } = await import('@/lib/domains');
      const domainDetails = await getAllDomainDetails();
      const matchedDomain = domainDetails.find((d) => d.domain.toLowerCase() === domainPart);

      if (matchedDomain?.isVip) {
        const vipToken = req.headers.get('x-vip-token') || new URL(req.url).searchParams.get('vip_token') || '';
        const { verifyVipSessionToken } = await import('@/lib/auth');
        const isVipValid = verifyVipSessionToken(vipToken);

        if (!isVipValid) {
          return NextResponse.json(
            { error: `Pesan ini milik domain VIP @${domainPart}. Kode CDK / Password diperlukan.` },
            { status: 403 }
          );
        }
      }
    }

    // Temukan dan update status isRead menjadi true
    const message = await Message.findByIdAndUpdate(
      id,
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
    console.error('Error fetching single message:', error);
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
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // 1. Validasi Global Access Gate
    const { getAccessSettings } = await import('@/lib/settings');
    const access = await getAccessSettings();
    if (access.enabled) {
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

    const existingMsg = await Message.findById(id).lean();
    if (!existingMsg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // 2. Validasi Domain VIP jika pesan berada di domain VIP
    const recipient = (existingMsg as any).recipient || '';
    const domainPart = recipient.includes('@') ? recipient.split('@')[1]?.toLowerCase() : '';
    if (domainPart) {
      const { getAllDomainDetails } = await import('@/lib/domains');
      const domainDetails = await getAllDomainDetails();
      const matchedDomain = domainDetails.find((d) => d.domain.toLowerCase() === domainPart);

      if (matchedDomain?.isVip) {
        const vipToken = req.headers.get('x-vip-token') || new URL(req.url).searchParams.get('vip_token') || '';
        const { verifyVipSessionToken } = await import('@/lib/auth');
        const isVipValid = verifyVipSessionToken(vipToken);

        if (!isVipValid) {
          return NextResponse.json(
            { error: `Pesan ini milik domain VIP @${domainPart}. Kode CDK / Password diperlukan.` },
            { status: 403 }
          );
        }
      }
    }

    const result = await Message.findByIdAndDelete(id);

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
