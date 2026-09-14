import { NextRequest, NextResponse } from 'next/server';
import { getAllDomains, addDomainToDb, removeDomainFromDb } from '@/lib/domains';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const domains = await getAllDomains();
    return NextResponse.json({
      success: true,
      domains: domains,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil daftar domain', details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Parameter "domain" wajib diisi' },
        { status: 400 }
      );
    }

    const result = await addDomainToDb(domain);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal menambahkan domain' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let domain = searchParams.get('domain');

    if (!domain) {
      const body = await req.json().catch(() => ({}));
      domain = body.domain;
    }

    if (!domain) {
      return NextResponse.json(
        { error: 'Parameter "domain" wajib diisi' },
        { status: 400 }
      );
    }

    const result = await removeDomainFromDb(domain);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal menghapus domain' },
      { status: 400 }
    );
  }
}
