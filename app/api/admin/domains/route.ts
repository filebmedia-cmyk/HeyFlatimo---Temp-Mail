import { NextRequest, NextResponse } from 'next/server';
import {
  getAllDomainDetails,
  addDomainToDb,
  toggleDomainVip,
  removeDomainFromDb,
} from '@/lib/domains';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Anda wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    const domains = await getAllDomainDetails();
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
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Anda wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { domain, isVip } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Parameter "domain" wajib diisi' },
        { status: 400 }
      );
    }

    const result = await addDomainToDb(domain, Boolean(isVip));
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal menambahkan domain' },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Anda wajib login sebagai admin.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { domain, isVip } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Parameter "domain" wajib diisi' },
        { status: 400 }
      );
    }

    const result = await toggleDomainVip(domain, isVip);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal mengubah status VIP domain' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Anda wajib login sebagai admin.' },
        { status: 401 }
      );
    }

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
