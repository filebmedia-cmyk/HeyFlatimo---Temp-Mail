import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/lib/models/Message';
import { Domain } from '@/lib/models/Domain';
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

    const update = await req.json().catch(() => null);
    if (!update) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const token = settings.botToken;
    const origin = req.nextUrl.origin || 'https://heyflatimo.com';

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
        const domainDoc = await Domain.findOne({ isActive: true }).lean();
        const domainName = domainDoc?.domain || 'mail.heyflatimo.com';
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

      // Command /start or /help
      if (text.startsWith('/start') || text.startsWith('/help')) {
        const welcomeText =
          `Selamat datang di <b>HeyFlatimo Bot Reader</b>!\n\n` +
          `Layanan baca pesan email sementara dan ekstraksi kode OTP otomatis dengan aman dan cepat.\n\n` +
          `<b>Daftar Perintah:</b>\n` +
          `• <code>/generate</code> - Buat alamat email acak baru\n` +
          `• <code>/otp &lt;email&gt;</code> - Cek kode OTP email masuk terbaru\n` +
          `• <code>/inbox &lt;email&gt;</code> - Baca 3 pesan email terakhir\n` +
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

      // Command /generate
      if (text.startsWith('/generate') || text.toLowerCase() === 'generate') {
        const domainDoc = await Domain.findOne({ isActive: true }).lean();
        const domainName = domainDoc?.domain || 'mail.heyflatimo.com';
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

      // Command /otp <email>
      if (text.startsWith('/otp')) {
        const parts = text.split(/\s+/);
        const targetEmail = parts[1]?.toLowerCase()?.trim();

        if (!targetEmail || !targetEmail.includes('@')) {
          const formatted = formatTelegramMessage(
            '⚠️ FORMAT PERINTAH SALAH',
            `Mohon sertakan alamat email target.\n\n<b>Contoh Penggunaan:</b>\n<code>/otp user@domain.com</code>\n\nAtau gunakan tombol <b>Generate Email Baru</b> di bawah.`
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

      // Command /inbox <email>
      if (text.startsWith('/inbox')) {
        const parts = text.split(/\s+/);
        const targetEmail = parts[1]?.toLowerCase()?.trim();

        if (!targetEmail || !targetEmail.includes('@')) {
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

      // Default fallback when user types any email directly
      if (text.includes('@')) {
        const potentialEmail = text.replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase();
        const formatted = formatTelegramMessage(
          '🔍 CARI PESAN / OTP',
          `Apakah Anda ingin mengecek pesan untuk email <code>${escapeTelegramHtml(potentialEmail)}</code>?`,
          { email: potentialEmail }
        );

        await sendTelegramMessage(token, chatId, formatted, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📩 Cek OTP Sekarang', callback_data: `otp:${potentialEmail}` },
                { text: '🌐 Buka di Web', url: `${origin}/${encodeURIComponent(potentialEmail)}` },
              ],
            ],
          },
        });

        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Telegram Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
