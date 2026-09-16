import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
  Message,
  findMessagesMultiCluster,
} from '@/lib/models/Message';
import { getAllDomainDetails } from '@/lib/domains';
import { getTelegramSettings } from '@/lib/settings';
import { extractOtp, extractLinks } from '@/lib/otpParser';
import { formatDateWIB } from '@/lib/formatters';
import { generateRandomPrefix } from '@/lib/generator';
import {
  sendTelegramMessage,
  editTelegramMessageText,
  answerTelegramCallbackQuery,
  formatTelegramMessage,
  escapeTelegramHtml,
} from '@/lib/telegram';

export const dynamic = 'force-dynamic';

/**
 * Checks if an email's domain is marked as VIP
 */
async function checkIsDomainVip(email: string): Promise<boolean> {
  const parts = email.split('@');
  if (parts.length < 2) return false;
  const domainPart = parts[1].toLowerCase().trim();
  const domainDetails = await getAllDomainDetails();
  const found = domainDetails.find((d) => d.domain.toLowerCase() === domainPart);
  return Boolean(found?.isVip);
}

/**
 * Gets a random Free domain (excludes VIP domains)
 */
async function getRandomFreeDomain(): Promise<string> {
  const domainDetails = await getAllDomainDetails();
  const freeDomains = domainDetails.filter((d) => !d.isVip);
  if (freeDomains.length > 0) {
    const randomIndex = Math.floor(Math.random() * freeDomains.length);
    return freeDomains[randomIndex].domain;
  }
  return 'mail.heyflatimo.com';
}

/**
 * Returns standard inline keyboard buttons:
 * 1. Buat Email Baru
 * 2. Baca Inbox Email
 * 3. Buka Web Email
 */
function getStandardKeyboard(origin: string, email?: string) {
  if (email) {
    return {
      inline_keyboard: [
        [
          { text: 'Baca Inbox Email', callback_data: `inbox:${email}` },
          { text: 'Buka Web Email', url: `${origin}/${encodeURIComponent(email)}` },
        ],
        [
          { text: 'Buat Email Baru', callback_data: 'gen_email' },
        ],
      ],
    };
  }
  return {
    inline_keyboard: [
      [
        { text: 'Buat Email Baru', callback_data: 'gen_email' },
        { text: 'Buka Web Email', url: origin },
      ],
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const settings = await getTelegramSettings();
    if (!settings.botToken) {
      return NextResponse.json({ error: 'Telegram Bot is not configured yet' }, { status: 400 });
    }

    if (!settings.enabled) {
      return NextResponse.json({ ok: true, message: 'Telegram Bot is disabled in settings' });
    }

    const update = await req.json().catch(() => null);
    if (!update) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const token = settings.botToken;
    let origin = 'https://heyflatimo.com';
    if (settings.webhookUrl && settings.webhookUrl.startsWith('http')) {
      try {
        origin = new URL(settings.webhookUrl).origin;
      } catch (e) {}
    } else {
      const proto = req.headers.get('x-forwarded-proto') || (req.nextUrl.protocol ? req.nextUrl.protocol.replace(':', '') : 'https');
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
      origin = `${proto}://${host}`;
    }

    await connectToDatabase();

    // 1. Handle Callback Query from Inline Keyboard Buttons (In-place editMessageText)
    if (update.callback_query) {
      const cq = update.callback_query;
      const callbackData: string = cq.data || '';
      const chatId = cq.message?.chat?.id;
      const messageId = cq.message?.message_id;

      // Handle Cek OTP / Baca Inbox callback
      if (callbackData.startsWith('otp:') || callbackData.startsWith('inbox:')) {
        const targetEmail = callbackData.replace(/^(otp:|inbox:)/, '').trim().toLowerCase();

        // VIP domain check
        const isVip = await checkIsDomainVip(targetEmail);
        if (isVip) {
          const formatted = formatTelegramMessage(
            'DOMAIN VIP EKSKLUSIF',
            `Alamat email <code>${escapeTelegramHtml(
              targetEmail
            )}</code> menggunakan Domain VIP eksklusif.\n\nAkses kotak masuk untuk Domain VIP hanya dapat dibuka melalui website resmi HeyFlatimo menggunakan Kode Akses VIP.`,
            { email: targetEmail }
          );

          const vipKeyboard = {
            inline_keyboard: [
              [{ text: 'Buka Web Email', url: `${origin}/${encodeURIComponent(targetEmail)}` }],
              [{ text: 'Buat Email Baru (Free)', callback_data: 'gen_email' }],
            ],
          };

          if (chatId && messageId) {
            const editRes = await editTelegramMessageText(token, chatId, messageId, formatted, {
              reply_markup: vipKeyboard,
            });
            if (!editRes.success) {
              await sendTelegramMessage(token, chatId, formatted, { reply_markup: vipKeyboard });
            }
          } else if (chatId) {
            await sendTelegramMessage(token, chatId, formatted, { reply_markup: vipKeyboard });
          }

          await answerTelegramCallbackQuery(token, cq.id, 'Domain VIP eksklusif website');
          return NextResponse.json({ ok: true });
        }

        // Fetch messages for Free domain
        const msgList = await findMessagesMultiCluster({ recipient: targetEmail }, { limit: 3 });

        if (msgList.length > 0) {
          const latestMsg = msgList[0];
          const otpRes = extractOtp(latestMsg.bodyText || '', latestMsg.bodyHtml || '', latestMsg.subject || '');
          const linksRes = extractLinks(latestMsg.bodyText || '', latestMsg.bodyHtml || '');

          let contentText = '';
          if (otpRes.found && otpRes.otp) {
            contentText = `<b>KODE OTP: <code>${otpRes.otp}</code></b>\n\n<b>Subjek:</b> ${escapeTelegramHtml(
              latestMsg.subject || '(Tanpa Subjek)'
            )}`;
          } else {
            contentText = `<b>Pesan Masuk:</b>\n\n<b>Subjek:</b> ${escapeTelegramHtml(
              latestMsg.subject || '(Tanpa Subjek)'
            )}\n\n<i>${escapeTelegramHtml(
              (latestMsg.bodyText || '').slice(0, 250) || 'Buka website untuk membaca isi lengkap.'
            )}</i>`;
          }

          if (linksRes.found && linksRes.primaryLink) {
            contentText += `\n\n<b>Link Verifikasi:</b> ${escapeTelegramHtml(linksRes.primaryLink)}`;
          }

          if (msgList.length > 1) {
            contentText += `\n\n<i>(Total ${msgList.length} pesan di inbox)</i>`;
          }

          const formatted = formatTelegramMessage('INBOX PESAN & KODE OTP', contentText, {
            email: targetEmail,
            sender: latestMsg.sender,
            time: formatDateWIB(latestMsg.createdAt),
          });

          if (chatId && messageId) {
            const editRes = await editTelegramMessageText(token, chatId, messageId, formatted, {
              reply_markup: getStandardKeyboard(origin, targetEmail),
            });
            if (!editRes.success) {
              await sendTelegramMessage(token, chatId, formatted, {
                reply_markup: getStandardKeyboard(origin, targetEmail),
              });
            }
          } else if (chatId) {
            await sendTelegramMessage(token, chatId, formatted, {
              reply_markup: getStandardKeyboard(origin, targetEmail),
            });
          }

          await answerTelegramCallbackQuery(token, cq.id, 'Inbox diperbarui');
        } else {
          const formatted = formatTelegramMessage(
            'INBOX MASIH KOSONG',
            `Belum ada email masuk untuk <code>${escapeTelegramHtml(
              targetEmail
            )}</code>.\n\nKirim email atau minta kode verifikasi, lalu klik tombol Baca Inbox Email di bawah.`,
            { email: targetEmail }
          );

          if (chatId && messageId) {
            const editRes = await editTelegramMessageText(token, chatId, messageId, formatted, {
              reply_markup: getStandardKeyboard(origin, targetEmail),
            });
            if (!editRes.success) {
              await sendTelegramMessage(token, chatId, formatted, {
                reply_markup: getStandardKeyboard(origin, targetEmail),
              });
            }
          } else if (chatId) {
            await sendTelegramMessage(token, chatId, formatted, {
              reply_markup: getStandardKeyboard(origin, targetEmail),
            });
          }

          await answerTelegramCallbackQuery(token, cq.id, 'Inbox masih kosong');
        }

        return NextResponse.json({ ok: true });
      }

      // Handle Buat Email Baru callback
      if (callbackData === 'gen_email') {
        const freeDomain = await getRandomFreeDomain();
        const newEmail = `${generateRandomPrefix()}@${freeDomain}`.toLowerCase();

        const formatted = formatTelegramMessage(
          'EMAIL SEMENTARA BERHASIL DIBUAT',
          `Gunakan alamat email ini untuk mendaftar akun atau menerima kode OTP verifikasi.\n\nKlik tombol <b>Baca Inbox Email</b> di bawah setelah kode dikirimkan.`,
          {
            email: newEmail,
          }
        );

        if (chatId && messageId) {
          const editRes = await editTelegramMessageText(token, chatId, messageId, formatted, {
            reply_markup: getStandardKeyboard(origin, newEmail),
          });
          if (!editRes.success) {
            await sendTelegramMessage(token, chatId, formatted, {
              reply_markup: getStandardKeyboard(origin, newEmail),
            });
          }
        } else if (chatId) {
          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: getStandardKeyboard(origin, newEmail),
          });
        }

        await answerTelegramCallbackQuery(token, cq.id, 'Email baru siap digunakan');
        return NextResponse.json({ ok: true });
      }

      await answerTelegramCallbackQuery(token, cq.id);
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Direct User Messages (text commands and email lookups)
    if (update.message && update.message.text) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text.trim();
      const lower = text.toLowerCase();

      // Command /start or /help or menu
      if (lower.startsWith('/start') || lower.startsWith('/help') || lower === 'help' || lower === 'menu') {
        const welcomeText =
          `Selamat datang di <b>HeyFlatimo Bot Reader</b>!\n\n` +
          `Layanan membaca pesan email sementara dan ekstraksi kode OTP serta link verifikasi secara instan.\n\n` +
          `<b>Daftar Perintah:</b>\n` +
          `• <code>/generate</code> - Buat email sementara baru (Domain Free)\n` +
          `• <code>/inbox &lt;email&gt;</code> - Baca pesan inbox & kode OTP\n` +
          `• <i>Kirim alamat email langsung</i> - Otomatis baca inbox email tersebut\n` +
          `• <code>/help</code> - Panduan bot\n\n` +
          `<i>Catatan: Bot Telegram hanya melayani Domain Free. Domain VIP dapat diakses eksklusif di website.</i>`;

        const formatted = formatTelegramMessage('HEYFLATIMO TEMP MAIL BOT', welcomeText);

        await sendTelegramMessage(token, chatId, formatted, {
          reply_markup: getStandardKeyboard(origin),
        });

        return NextResponse.json({ ok: true });
      }

      // Command /generate or 'generate' or 'buat email'
      if (lower.startsWith('/generate') || lower === 'generate' || lower.includes('buat email')) {
        const freeDomain = await getRandomFreeDomain();
        const newEmail = `${generateRandomPrefix()}@${freeDomain}`.toLowerCase();

        const formatted = formatTelegramMessage(
          'EMAIL SEMENTARA BERHASIL DIBUAT',
          `Gunakan alamat email ini untuk mendaftar akun atau menerima kode OTP verifikasi.\n\nKlik tombol <b>Baca Inbox Email</b> di bawah setelah kode dikirimkan.`,
          {
            email: newEmail,
          }
        );

        await sendTelegramMessage(token, chatId, formatted, {
          reply_markup: getStandardKeyboard(origin, newEmail),
        });

        return NextResponse.json({ ok: true });
      }

      // Command /inbox, /otp, or direct email lookup
      const isInboxCommand = lower.startsWith('/inbox') || lower.startsWith('inbox') || lower.startsWith('baca inbox');
      const isOtpCommand = lower.startsWith('/otp') || lower.startsWith('otp') || lower.startsWith('cek otp');
      const containsAt = text.includes('@');

      if (isInboxCommand || isOtpCommand || containsAt) {
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const targetEmail = (emailMatch ? emailMatch[0] : '').toLowerCase().trim();

        if (!targetEmail) {
          const formatted = formatTelegramMessage(
            'FORMAT PERINTAH SALAH',
            `Mohon sertakan alamat email yang valid.\n\n<b>Contoh Penggunaan:</b>\n<code>/inbox user@domain.com</code>\n\nAtau klik tombol <b>Buat Email Baru</b> di bawah.`
          );

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: getStandardKeyboard(origin),
          });
          return NextResponse.json({ ok: true });
        }

        // Check if VIP Domain
        const isVip = await checkIsDomainVip(targetEmail);
        if (isVip) {
          const formatted = formatTelegramMessage(
            'DOMAIN VIP EKSKLUSIF',
            `Alamat email <code>${escapeTelegramHtml(
              targetEmail
            )}</code> menggunakan Domain VIP eksklusif.\n\nAkses kotak masuk untuk Domain VIP hanya dapat dibuka melalui website resmi HeyFlatimo menggunakan Kode Akses VIP.`,
            { email: targetEmail }
          );

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Buka Web Email', url: `${origin}/${encodeURIComponent(targetEmail)}` }],
                [{ text: 'Buat Email Baru (Free)', callback_data: 'gen_email' }],
              ],
            },
          });
          return NextResponse.json({ ok: true });
        }

        const msgList = await findMessagesMultiCluster({ recipient: targetEmail }, { limit: 3 });

        if (msgList.length > 0) {
          const latestMsg = msgList[0];
          const otpRes = extractOtp(latestMsg.bodyText || '', latestMsg.bodyHtml || '', latestMsg.subject || '');
          const linksRes = extractLinks(latestMsg.bodyText || '', latestMsg.bodyHtml || '');

          let contentText = '';
          if (otpRes.found && otpRes.otp) {
            contentText = `<b>KODE OTP: <code>${otpRes.otp}</code></b>\n\n<b>Subjek:</b> ${escapeTelegramHtml(
              latestMsg.subject || '(Tanpa Subjek)'
            )}`;
          } else {
            contentText = `<b>Pesan Masuk:</b>\n\n<b>Subjek:</b> ${escapeTelegramHtml(
              latestMsg.subject || '(Tanpa Subjek)'
            )}\n\n<i>${escapeTelegramHtml(
              (latestMsg.bodyText || '').slice(0, 250) || 'Buka website untuk membaca isi lengkap.'
            )}</i>`;
          }

          if (linksRes.found && linksRes.primaryLink) {
            contentText += `\n\n<b>Link Verifikasi:</b> ${escapeTelegramHtml(linksRes.primaryLink)}`;
          }

          if (msgList.length > 1) {
            contentText += `\n\n<i>(Total ${msgList.length} pesan di inbox)</i>`;
          }

          const formatted = formatTelegramMessage('INBOX PESAN & KODE OTP', contentText, {
            email: targetEmail,
            sender: latestMsg.sender,
            time: formatDateWIB(latestMsg.createdAt),
          });

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: getStandardKeyboard(origin, targetEmail),
          });
        } else {
          const formatted = formatTelegramMessage(
            'INBOX MASIH KOSONG',
            `Belum ada email masuk untuk <code>${escapeTelegramHtml(
              targetEmail
            )}</code>.\n\nKirim email atau minta kode verifikasi, lalu klik tombol Baca Inbox Email di bawah.`,
            { email: targetEmail }
          );

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: getStandardKeyboard(origin, targetEmail),
          });
        }

        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Telegram Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
