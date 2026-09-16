import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyDetailed } from '@/lib/auth';
import { generateRandomPrefix } from '@/lib/generator';
import { getAllDomains } from '@/lib/domains';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized: Invalid or missing API Key' },
      { status: auth.status || 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const customPrefix = searchParams.get('prefix')?.trim().toLowerCase();
  const customDomain = searchParams.get('domain')?.trim().toLowerCase();

  const domains = await getAllDomains();
  const finalPrefix = customPrefix || generateRandomPrefix();
  const finalDomain = customDomain || (domains.length > 0 ? domains[Math.floor(Math.random() * domains.length)] : (req.headers.get('host')?.split(':')[0] || ''));

  if (!finalDomain) {
    return NextResponse.json(
      {
        success: false,
        error: 'Belum ada domain yang terdaftar. Tambahkan domain di menu admin atau gunakan parameter ?domain=namadomain.com',
      },
      { status: 400 }
    );
  }

  const fullEmail = `${finalPrefix}@${finalDomain}`;

  return NextResponse.json({
    success: true,
    email: fullEmail,
    prefix: finalPrefix,
    domain: finalDomain,
    generatedAt: new Date().toISOString(),
  });
}
