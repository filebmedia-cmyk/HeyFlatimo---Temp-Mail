import { NextResponse } from 'next/server';
import { getAccessSettings, getAnnouncementSettings, getHeroHeaderSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const access = await getAccessSettings();
    const announcement = await getAnnouncementSettings();
    const heroHeader = await getHeroHeaderSettings();

    return NextResponse.json({
      success: true,
      accessKeyRequired: access.enabled,
      accessMessage: access.message,
      heroHeader: {
        badgeText: heroHeader.badgeText,
        titlePrefix: heroHeader.titlePrefix,
        titleHighlight: heroHeader.titleHighlight,
        subtitle: heroHeader.subtitle,
      },
      announcement: {
        enabled: announcement.enabled,
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        tag: announcement.tag,
        displayMode: announcement.displayMode,
        buttonEnabled: Boolean(announcement.buttonEnabled),
        buttonText: announcement.buttonText || '',
        buttonLink: announcement.buttonLink || '',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
