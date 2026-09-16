import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyDetailed } from '@/lib/auth';
import { getAllDomainDetails } from '@/lib/domains';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await validateApiKeyDetailed(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized: Invalid or missing API Key.' },
      { status: auth.status || 401 }
    );
  }

  try {
    const details = await getAllDomainDetails();
    return NextResponse.json({
      success: true,
      count: details.length,
      domains: details.map((d) => d.domain),
      domainDetails: details,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      count: 0,
      domains: [],
      domainDetails: [],
    });
  }
}
