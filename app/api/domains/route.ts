import { NextResponse } from 'next/server';
import { getAllDomains } from '@/lib/domains';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const domains = await getAllDomains();
    return NextResponse.json({
      success: true,
      domains: domains,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      domains: [],
    });
  }
}
