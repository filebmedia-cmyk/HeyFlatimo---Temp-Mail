import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { getAllDomainDetails } from '@/lib/domains';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const isValid = await validateApiKey(req);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing API Key. Gunakan header x-api-key atau ?api_key=...' },
      { status: 401 }
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
