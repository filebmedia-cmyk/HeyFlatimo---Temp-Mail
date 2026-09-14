import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { getAllDomains } from '@/lib/domains';

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
    const domains = await getAllDomains();
    return NextResponse.json({
      success: true,
      count: domains.length,
      domains: domains,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      count: 0,
      domains: [],
    });
  }
}
