import { NextRequest, NextResponse } from 'next/server';
import {
  getAccessSettings,
  saveAccessSettings,
  getAnnouncementSettings,
  saveAnnouncementSettings,
} from '@/lib/settings';
import { getAdminCredentials, saveAdminCredentials, verifyAdminRequest } from '@/lib/auth';

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

    const access = await getAccessSettings();
    const announcement = await getAnnouncementSettings();
    const creds = await getAdminCredentials();

    return NextResponse.json({
      success: true,
      access,
      announcement,
      credentials: {
        username: creds.username,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
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
    let updatedAccess = null;
    let updatedAnnouncement = null;
    let updatedCredentials = null;

    if (body.access) {
      updatedAccess = await saveAccessSettings(body.access);
    }

    if (body.announcement) {
      updatedAnnouncement = await saveAnnouncementSettings(body.announcement);
    }

    if (body.credentials) {
      const u = body.credentials.username?.trim();
      const p = body.credentials.password?.trim();
      if (u && p) {
        updatedCredentials = await saveAdminCredentials(u, p);
      }
    }

    const access = updatedAccess || (await getAccessSettings());
    const announcement = updatedAnnouncement || (await getAnnouncementSettings());
    const credentials = updatedCredentials || (await getAdminCredentials());

    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil disimpan',
      access,
      announcement,
      credentials: {
        username: credentials.username,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
