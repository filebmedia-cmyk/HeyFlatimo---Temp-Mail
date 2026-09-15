import { NextRequest, NextResponse } from 'next/server';
import {
  getAccessSettings,
  saveAccessSettings,
  getAnnouncementSettings,
  saveAnnouncementSettings,
  getTelegramSettings,
  saveTelegramSettings,
  getRetentionSettings,
  saveRetentionSettings,
} from '@/lib/settings';
import { getAdminCredentials, saveAdminCredentials, verifyAdminRequest } from '@/lib/auth';
import {
  getTelegramBotInfo,
  getTelegramWebhookInfo,
  setTelegramWebhook,
  deleteTelegramWebhook,
} from '@/lib/telegram';

export const dynamic = 'force-dynamic';

function getCanonicalOrigin(req: NextRequest): string {
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = forwardedHost || req.headers.get('host') || req.nextUrl.host;
  const proto = forwardedProto || (req.nextUrl.protocol ? req.nextUrl.protocol.replace(':', '') : 'http');
  return `${proto}://${host}`;
}

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
    const telegram = await getTelegramSettings();
    const retention = await getRetentionSettings();
    const creds = await getAdminCredentials();

    return NextResponse.json({
      success: true,
      access,
      announcement,
      telegram,
      retention,
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
    let updatedTelegram = null;
    let updatedRetention = null;
    let updatedCredentials = null;

    // Handle Telegram Actions (Set Webhook, Delete Webhook, Test Bot, Get Webhook Info)
    if (body.telegramAction) {
      const currentTg = await getTelegramSettings();
      const token = (body.botToken || currentTg.botToken || '').trim();

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Token Bot Telegram tidak boleh kosong.' },
          { status: 400 }
        );
      }

      if (body.telegramAction === 'test_bot') {
        const testRes = await getTelegramBotInfo(token);
        if (!testRes.success) {
          return NextResponse.json(
            { success: false, error: testRes.error || 'Token Bot Telegram tidak valid atau tidak dapat terhubung.' },
            { status: 400 }
          );
        }
        return NextResponse.json({
          success: true,
          message: `Koneksi Bot Berhasil! Bot: @${testRes.bot?.username} (${testRes.bot?.first_name})`,
          bot: testRes.bot,
        });
      }

      if (body.telegramAction === 'get_webhook_info') {
        const infoRes = await getTelegramWebhookInfo(token);
        const botRes = await getTelegramBotInfo(token);
        return NextResponse.json({
          success: true,
          webhook: infoRes.webhook || null,
          bot: botRes.bot || null,
          error: infoRes.error || null,
        });
      }

      if (body.telegramAction === 'set_webhook') {
        const origin = getCanonicalOrigin(req);
        const webhookUrl = `${origin}/api/webhook/telegram`;

        if (!webhookUrl.startsWith('https://')) {
          return NextResponse.json(
            {
              success: false,
              error: `Telegram API mewajibkan URL Webhook berprotokol HTTPS. URL domain Anda saat ini: "${webhookUrl}". Pastikan website Anda sudah memiliki sertifikat SSL/HTTPS aktif.`,
            },
            { status: 400 }
          );
        }

        const hookRes = await setTelegramWebhook(token, webhookUrl);

        if (!hookRes.success) {
          return NextResponse.json(
            { success: false, error: hookRes.error || 'Gagal mengatur Webhook Telegram' },
            { status: 400 }
          );
        }

        const botInfo = await getTelegramBotInfo(token);
        const botUsername = botInfo.bot?.username || '';

        updatedTelegram = await saveTelegramSettings({
          botToken: token,
          botUsername,
          enabled: true,
          webhookUrl,
        });

        return NextResponse.json({
          success: true,
          message: `Webhook Telegram Berhasil Diaktifkan ke: ${webhookUrl}`,
          telegram: updatedTelegram,
        });
      }

      if (body.telegramAction === 'delete_webhook') {
        const delRes = await deleteTelegramWebhook(token);
        if (!delRes.success) {
          return NextResponse.json(
            { success: false, error: delRes.error || 'Gagal menghapus Webhook Telegram' },
            { status: 400 }
          );
        }

        updatedTelegram = await saveTelegramSettings({
          enabled: false,
          webhookUrl: '',
        });

        return NextResponse.json({
          success: true,
          message: 'Webhook Telegram berhasil dinonaktifkan/dihapus.',
          telegram: updatedTelegram,
        });
      }
    }

    if (body.access) {
      updatedAccess = await saveAccessSettings(body.access);
    }

    if (body.announcement) {
      updatedAnnouncement = await saveAnnouncementSettings(body.announcement);
    }

    if (body.telegram) {
      const incomingTg = body.telegram;
      const cleanToken = (incomingTg.botToken || '').trim();
      const isEnabled = Boolean(incomingTg.enabled);
      let hookUrl = incomingTg.webhookUrl || '';
      let botUser = incomingTg.botUsername || '';

      if (cleanToken) {
        // Fetch username from Telegram
        const botRes = await getTelegramBotInfo(cleanToken);
        if (botRes.success && botRes.bot?.username) {
          botUser = botRes.bot.username;
        }

        const origin = getCanonicalOrigin(req);
        const targetWebhook = `${origin}/api/webhook/telegram`;

        if (isEnabled) {
          if (targetWebhook.startsWith('https://')) {
            const hookRes = await setTelegramWebhook(cleanToken, targetWebhook);
            if (hookRes.success) {
              hookUrl = targetWebhook;
            }
          }
        } else {
          // If disabled, remove webhook from Telegram
          await deleteTelegramWebhook(cleanToken).catch(() => null);
          hookUrl = '';
        }
      }

      updatedTelegram = await saveTelegramSettings({
        botToken: cleanToken,
        botUsername: botUser,
        enabled: isEnabled,
        webhookUrl: hookUrl,
      });
    }

    if (body.retention) {
      updatedRetention = await saveRetentionSettings(body.retention);
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
    const telegram = updatedTelegram || (await getTelegramSettings());
    const retention = updatedRetention || (await getRetentionSettings());
    const credentials = updatedCredentials || (await getAdminCredentials());

    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil disimpan',
      access,
      announcement,
      telegram,
      retention,
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
