import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyDetailed } from '@/lib/auth';
import { getAllDomainDetails } from '@/lib/domains';
import { recordBotLog } from '@/lib/botLogger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
    recordBotLog({
      action: 'domains',
      req,
      auth,
      status: auth.status === 403 ? 'blocked' : 'error',
      statusCode: auth.status || 401,
      message: auth.error || 'Ditolak: API Key tidak valid / terikat',
      responseTimeMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: auth.error || 'Unauthorized: Invalid or missing API Key.' },
      { status: auth.status || 401 }
    );
  }

  try {
    const details = await getAllDomainDetails();
    const responseTimeMs = Date.now() - startTime;

    recordBotLog({
      action: 'domains',
      req,
      auth,
      status: 'success',
      statusCode: 200,
      message: `Mengambil daftar domain aktif (${details.length} domain)`,
      responseTimeMs,
    });

    return NextResponse.json({
      success: true,
      count: details.length,
      domains: details.map((d) => d.domain),
      domainDetails: details,
    });
  } catch (err: any) {
    const responseTimeMs = Date.now() - startTime;
    recordBotLog({
      action: 'domains',
      req,
      auth,
      status: 'error',
      statusCode: 500,
      message: `Error mengambil daftar domain: ${err.message}`,
      responseTimeMs,
    });

    return NextResponse.json({
      success: true,
      count: 0,
      domains: [],
      domainDetails: [],
    });
  }
}
