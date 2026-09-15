import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { getAllDomains } from '@/lib/domains';
import { getTelegramSettings } from '@/lib/settings';
import { extractOtp, extractLinks } from '@/lib/otpParser';
import { formatDateWIB } from '@/lib/formatters';
import { generateRandomPrefix } from '@/lib/generator';
import {
  sendTelegramMessage,
  answerTelegramCallbackQuery,
  formatTelegramMessage,
  escapeTelegramHtml,
} from '@/lib/telegram';

export const dynamic = 'force-dynamic';

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

    // 1. Handle Callback Query from Inline Keyboard Buttons
    if (update.callback_query) {
      const cq = update.callback_query;
      const callbackData: string = cq.data || '';
      const chatId = cq.message?.chat?.id;

      if (callbackData.startsWith('otp:')) {
        const targetEmail = callbackData.replace('otp:', '').trim().toLowerCase();
        await answerTelegramCallbackQuery(token, cq.id, '🔄 Memeriksa OTP terbaru...');

        const latestMsg = await Message.findOne({ recipient: targetEmail }).sort({ createdAt: -1 }).lean();

        if (latestMsg) {
          const otpRes = extractOtp(latestMsg.bodyText || '', latestMsg.bodyHtml || '', latestMsg.subject || '');
          const linksRes = extractLinks(latestMsg.bodyText || '', latestMsg.bodyHtml || '');

          let contentText = '';
          if (otpRes.found && otpRes.otp) {
            contentText = `<b>KODE OTP: <code>${otpRes.otp}</code></b>\n\n📌 <b>Subjek:</b> ${escapeTelegramHtml(
              latestMsg.subject || '(Tanpa Subjek)'
            )}`;
          } else {
            contentText = `<b>Pesan Diterima</b> (Kode OTP belum terdeteksi secara otomatis):\n\n📌 <b>Subjek:</b> ${escapeTelegramHtml(
              latestMsg.subject || '(Tanpa Subjek)'
            )}\n\n<i>${escapeTelegramHtml(
              (latestMsg.bodyText || '').slice(0, 200) || 'Buka website untuk melihat konten lengkap.'
            )}</i>`;
          }

          if (linksRes.found && linksRes.primaryLink) {
            contentText += `\n\n🔗 <b>Link Verifikasi:</b> ${escapeTelegramHtml(linksRes.primaryLink)}`;
          }

          const formatted = formatTelegramMessage('📩 HASIL OTP TERBARU', contentText, {
            email: targetEmail,
            sender: latestMsg.sender,
            time: formatDateWIB(latestMsg.createdAt),
          });

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔄 Refresh OTP', callback_data: `otp:${targetEmail}` },
                  { text: '🌐 Buka Web Mailbox', url: `${origin}/${encodeURIComponent(targetEmail)}` },
                ],
              ],
            },
          });
        } else {
          const formatted = formatTelegramMessage(
            '📭 INBOX MASIH KOSONG',
            `Belum ada email masuk untuk <code>${escapeTelegramHtml(
              targetEmail
            )}</code>.\n\nKirim email atau minta kode verifikasi, lalu klik tombol Refresh di bawah.`,
            { email: targetEmail }
          );

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔄 Refresh Ulang', callback_data: `otp:${targetEmail}` },
                  { text: '🌐 Buka di Web', url: `${origin}/${encodeURIComponent(targetEmail)}` },
                ],
              ],
            },
          });
        }

        return NextResponse.json({ ok: true });
      }

      if (callbackData === 'gen_email') {
        await answerTelegramCallbackQuery(token, cq.id, '⚡ Membuat email baru...');
        const availableDomains = await getAllDomains();
        const domainName = availableDomains[0] || 'mail.heyflatimo.com';
        const newEmail = `${generateRandomPrefix()}@${domainName}`.toLowerCase();

        const formatted = formatTelegramMessage(
          '⚡ EMAIL SEMENTARA BERHASIL DIBUAT',
          `Gunakan alamat email ini untuk mendaftar akun atau menerima kode OTP verifikasi.\n\nKlik tombol <b>Cek OTP</b> di bawah setelah meminta pengiriman kode.`,
          {
            email: newEmail,
            extra: `🌐 <b>Akses Web:</b> ${origin}/${encodeURIComponent(newEmail)}`,
          }
        );

        await sendTelegramMessage(token, chatId, formatted, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📩 Cek OTP Email Ini', callback_data: `otp:${newEmail}` },
                { text: '🌐 Buka Inbox', url: `${origin}/${encodeURIComponent(newEmail)}` },
              ],
              [{ text: '🎲 Buat Email Lain', callback_data: 'gen_email' }],
            ],
          },
        });

        return NextResponse.json({ ok: true });
      }

      await answerTelegramCallbackQuery(token, cq.id);
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Direct User Messages
    if (update.message && update.message.text) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text.trim();
      const lower = text.toLowerCase();

      // Command /start or /help
      if (lower.startsWith('/start') || lower.startsWith('/help') || lower === 'help' || lower === 'menu') {
        const welcomeText =
          `Selamat datang di <b>HeyFlatimo Bot Reader</b>!\n\n` +
          `Layanan baca pesan email sementara dan ekstraksi kode OTP otomatis dengan aman dan cepat.\n\n` +
          `<b>Daftar Perintah:</b>\n` +
          `• <code>/generate</code> - Buat alamat email acak baru\n` +
          `• <code>/otp &lt;email&gt;</code> - Cek kode OTP email masuk terbaru\n` +
          `• <code>/inbox &lt;email&gt;</code> - Baca 3 pesan email terakhir\n` +
          `• <i>Kirim alamat email langsung</i> - Otomatis cek OTP email tersebut\n` +
          `• <code>/help</code> - Bantuan penggunaan bot`;

        const formatted = formatTelegramMessage('⚡ HEYFLATIMO TEMP MAIL BOT', welcomeText);

        await sendTelegramMessage(token, chatId, formatted, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '⚡ Generate Email Baru', callback_data: 'gen_email' }],
              [{ text: '🌐 Kunjungi Website HeyFlatimo', url: origin }],
            ],
          },
        });

        return NextResponse.json({ ok: true });
      }

      // Command /generate or 'generate' or 'buat email'
      if (lower.startsWith('/generate') || lower === 'generate' || lower.includes('buat email')) {
        const availableDomains = await getAllDomains();
        const domainName = availableDomains[0] || 'mail.heyflatimo.com';
        const newEmail = `${generateRandomPrefix()}@${domainName}`.toLowerCase();

        const formatted = formatTelegramMessage(
          '⚡ EMAIL SEMENTARA BERHASIL DIBUAT',
          `Gunakan alamat email di atas untuk mendaftar akun atau menerima verifikasi.\n\nKlik tombol <b>Cek OTP</b> di bawah saat kode sudah dikirimkan.`,
          {
            email: newEmail,
            extra: `🌐 <b>Akses Web:</b> ${origin}/${encodeURIComponent(newEmail)}`,
          }
        );

        await sendTelegramMessage(token, chatId, formatted, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📩 Cek OTP Email Ini', callback_data: `otp:${newEmail}` },
                { text: '🌐 Buka Inbox', url: `${origin}/${encodeURIComponent(newEmail)}` },
              ],
              [{ text: '🎲 Buat Email Lain', callback_data: 'gen_email' }],
            ],
          },
        });

        return NextResponse.json({ ok: true });
      }

      // Command /otp <email> or 'otp <email>' or 'cek otp <email>'
      if (lower.startsWith('/otp') || lower.startsWith('otp') || lower.startsWith('cek otp')) {
        const parts = text.split(/\s+/);
        // Find part with @
        let targetEmail = parts.find((p: string) => p.includes('@'))?.toLowerCase()?.trim();

        if (!targetEmail) {
          const formatted = formatTelegramMessage(
            '⚠️ FORMAT PERINTAH SALAH',
            `Mohon sertakan alamat email target.\n\n<b>Contoh Penggunaan:</b>\n<code>/otp user@domain.com</code>\n\nAtau buat email baru dengan tombol di bawah.`
          );

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: {
              inline_keyboard: [[{ text: '⚡ Generate Email Baru', callback_data: 'gen_email' }]],
            },
          });
          return NextResponse.json({ ok: true });
        }

        const latestMsg = await Message.findOne({ recipient: targetEmail }).sort({ createdAt: -1 }).lean();

        if (latestMsg) {
          const otpRes = extractOtp(latestMsg.bodyText || '', latestMsg.bodyHtml || '', latestMsg.subject || '');
          const linksRes = extractLinks(latestMsg.bodyText || '', latestMsg.bodyHtml || '');

          let contentText = '';
          if (otpRes.found && otpRes.otp) {
            contentText = `<b>KODE OTP: <code>${otpRes.otp}</code></b>\n\n📌 <b>Subjek:</b> ${escapeTelegramHtml(
              latestMsg.subject || '(Tanpa Subjek)'
            )}`;
          } else {
            contentText = `<b>Pesan Diterima</b> (OTP tidak terdeteksi otomatis):\n\n📌 <b>Subjek:</b> ${escapeTelegramHtml(
              latestMsg.subject || '(Tanpa Subjek)'
            )}\n\n<i>${escapeTelegramHtml(
              (latestMsg.bodyText || '').slice(0, 200) || 'Buka website untuk melihat email.'
            )}</i>`;
          }

          if (linksRes.found && linksRes.primaryLink) {
            contentText += `\n\n🔗 <b>Link Verifikasi:</b> ${escapeTelegramHtml(linksRes.primaryLink)}`;
          }

          const formatted = formatTelegramMessage('📩 KODE OTP TERBARU', contentText, {
            email: targetEmail,
            sender: latestMsg.sender,
            time: formatDateWIB(latestMsg.createdAt),
          });

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔄 Refresh OTP', callback_data: `otp:${targetEmail}` },
                  { text: '🌐 Buka Web Mailbox', url: `${origin}/${encodeURIComponent(targetEmail)}` },
                ],
              ],
            },
          });
        } else {
          const formatted = formatTelegramMessage(
            '📭 INBOX MASIH KOSONG',
            `Belum ada email masuk untuk <code>${escapeTelegramHtml(
              targetEmail
            )}</code>.\n\nKirim email atau minta kode verifikasi, lalu klik tombol Refresh di bawah.`,
            { email: targetEmail }
          );

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔄 Refresh Ulang', callback_data: `otp:${targetEmail}` },
                  { text: '🌐 Buka di Web', url: `${origin}/${encodeURIComponent(targetEmail)}` },
                ],
              ],
            },
          });
        }

        return NextResponse.json({ ok: true });
      }

      // Command /inbox <email> or 'inbox <email>'
      if (lower.startsWith('/inbox') || lower.startsWith('inbox') || lower.startsWith('baca inbox')) {
        const parts = text.split(/\s+/);
        let targetEmail = parts.find((p: string) => p.includes('@'))?.toLowerCase()?.trim();

        if (!targetEmail) {
          const formatted = formatTelegramMessage(
            '⚠️ FORMAT PERINTAH SALAH',
            `Mohon sertakan alamat email target.\n\n<b>Contoh Penggunaan:</b>\n<code>/inbox user@domain.com</code>`
          );

          await sendTelegramMessage(token, chatId, formatted);
          return NextResponse.json({ ok: true });
        }

        const msgList = await Message.find({ recipient: targetEmail }).sort({ createdAt: -1 }).limit(3).lean();

        if (msgList.length > 0) {
          let summary = `Menemukan <b>${msgList.length} pesan</b> terbaru:\n\n`;
          msgList.forEach((m, idx) => {
            const otpRes = extractOtp(m.bodyText || '', m.bodyHtml || '', m.subject || '');
            const otpBadge = otpRes.found && otpRes.otp ? ` [OTP: <code>${otpRes.otp}</code>]` : '';
            summary += `<b>${idx + 1}. Dari:</b> ${escapeTelegramHtml(m.sender)}\n`;
            summary += `   <b>Subjek:</b> ${escapeTelegramHtml(m.subject || '(Tanpa Subjek)')}${otpBadge}\n`;
            summary += `   <b>Waktu:</b> ${formatDateWIB(m.createdAt)}\n\n`;
          });

          const formatted = formatTelegramMessage('📬 DAFTAR INBOX PESAN', summary.trim(), {
            email: targetEmail,
          });

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔄 Refresh Inbox', callback_data: `otp:${targetEmail}` },
                  { text: '🌐 Buka di Web', url: `${origin}/${encodeURIComponent(targetEmail)}` },
                ],
              ],
            },
          });
        } else {
          const formatted = formatTelegramMessage(
            '📭 INBOX KOSONG',
            `Belum ada email masuk untuk <code>${escapeTelegramHtml(targetEmail)}</code>.`,
            { email: targetEmail }
          );

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔄 Refresh Ulang', callback_data: `otp:${targetEmail}` },
                  { text: '🌐 Buka di Web', url: `${origin}/${encodeURIComponent(targetEmail)}` },
                ],
              ],
            },
          });
        }

        return NextResponse.json({ ok: true });
      }

      // Direct email lookup (e.g. user sends 'abc@domain.com')
      if (text.includes('@')) {
        const potentialEmail = text.replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase();
        const latestMsg = await Message.findOne({ recipient: potentialEmail }).sort({ createdAt: -1 }).lean();

        if (latestMsg) {
          const otpRes = extractOtp(latestMsg.bodyText || '', latestMsg.bodyHtml || '', latestMsg.subject || '');
          const linksRes = extractLinks(latestMsg.bodyText || '', latestMsg.bodyHtml || '');

          let contentText = '';
          if (otpRes.found && otpRes.otp) {
            contentText = `<b>KODE OTP: <code>${otpRes.otp}</code></b>\n\n📌 <b>Subjek:</b> ${escapeTelegramHtml(
              latestMsg.subject || '(Tanpa Subjek)'
            )}`;
          } else {
            contentText = `<b>Pesan Diterima</b> (OTP tidak terdeteksi otomatis):\n\n📌 <b>Subjek:</b> ${escapeTelegramHtml(
              latestMsg.subject || '(Tanpa Subjek)'
            )}\n\n<i>${escapeTelegramHtml(
              (latestMsg.bodyText || '').slice(0, 200) || 'Buka website untuk melihat email.'
            )}</i>`;
          }

          if (linksRes.found && linksRes.primaryLink) {
            contentText += `\n\n🔗 <b>Link Verifikasi:</b> ${escapeTelegramHtml(linksRes.primaryLink)}`;
          }

          const formatted = formatTelegramMessage('📩 HASIL EMAIL MASUK', contentText, {
            email: potentialEmail,
            sender: latestMsg.sender,
            time: formatDateWIB(latestMsg.createdAt),
          });

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔄 Refresh OTP', callback_data: `otp:${potentialEmail}` },
                  { text: '🌐 Buka Inbox di Web', url: `${origin}/${encodeURIComponent(potentialEmail)}` },
                ],
              ],
            },
          });
        } else {
          const formatted = formatTelegramMessage(
            '📭 INBOX MASIH KOSONG',
            `Belum ada email masuk untuk <code>${escapeTelegramHtml(
              potentialEmail
            )}</code>.\n\nKirim email ke alamat ini, lalu klik tombol Refresh di bawah.`,
            { email: potentialEmail }
          );

          await sendTelegramMessage(token, chatId, formatted, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔄 Refresh Ulang', callback_data: `otp:${potentialEmail}` },
                  { text: '🌐 Buka di Web', url: `${origin}/${encodeURIComponent(potentialEmail)}` },
                ],
              ],
            },
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
