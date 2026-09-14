import { NextResponse } from 'next/server';
import { getAllDomainDetails } from '@/lib/domains';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const details = await getAllDomainDetails();
    return NextResponse.json({
      success: true,
      domains: details.map((d) => d.domain),
      domainDetails: details,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      domains: [],
      domainDetails: [],
    });
  }
}
