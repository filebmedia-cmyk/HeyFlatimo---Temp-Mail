import { NextResponse } from 'next/server';
import { getAccessSettings, getAnnouncementSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const access = await getAccessSettings();
    const announcement = await getAnnouncementSettings();

    return NextResponse.json({
      success: true,
      accessKeyRequired: access.enabled,
      accessMessage: access.message,
      announcement: {
        enabled: announcement.enabled,
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        tag: announcement.tag,
        displayMode: announcement.displayMode,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
