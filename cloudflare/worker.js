/**
 * Cloudflare Email Routing Worker for TMail
 *
 * Worker ini akan menerima email masuk dari Cloudflare Email Routing,
 * mem-parse konten MIME (From, To, Subject, Text, HTML),
 * dan mengirimkannya via Webhook HTTP POST ke endpoint Vercel aplikasi TMail Anda.
 *
 * DOKUMENTASI VARIABEL ENVIRONMENT (di Cloudflare Dashboard -> Settings -> Variables):
 * 1. WEBHOOK_URL    : URL Vercel Anda, contoh: https://tmail-anda.vercel.app
 * 2. WEBHOOK_SECRET : Secret token yang sama dengan WEBHOOK_SECRET di .env Vercel Anda
 */

import PostalMime from 'postal-mime';

export default {
  async email(message, env, ctx) {
    try {
      const webhookUrl = env.WEBHOOK_URL || 'https://your-app.vercel.app';
      const webhookSecret = env.WEBHOOK_SECRET || '';

      // 1. Baca raw email stream
      const rawEmail = await new Response(message.raw).arrayBuffer();

      // 2. Parse MIME menggunakan PostalMime
      const parser = new PostalMime();
      const parsed = await parser.parse(rawEmail);

      // Ekstrak penerima (To)
      const recipient = message.to || (parsed.to && parsed.to[0] ? parsed.to[0].address : '');
      const sender = message.from || (parsed.from ? `${parsed.from.name || ''} <${parsed.from.address}>` : 'Unknown');

      // 3. Susun Payload JSON
      const payload = {
        to: recipient,
        from: sender,
        senderAddress: parsed.from?.address || message.from,
        senderName: parsed.from?.name || '',
        subject: parsed.subject || '(Tanpa Subjek)',
        text: parsed.text || '',
        html: parsed.html || '',
        bodyText: parsed.text || '',
        bodyHtml: parsed.html || '',
        rawSize: rawEmail.byteLength,
        attachments: (parsed.attachments || []).map((att) => ({
          filename: att.filename || 'attachment',
          contentType: att.mimeType || 'application/octet-stream',
          size: att.content ? att.content.byteLength : 0,
        })),
        headers: Object.fromEntries(
          (parsed.headers || []).map((h) => [h.key.toLowerCase(), h.value])
        ),
      };

      // 4. Kirim ke Webhook Vercel
      const endpoint = `${webhookUrl.replace(/\/+$/, '')}/api/webhook/email`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': webhookSecret,
          'User-Agent': 'Cloudflare-Email-Worker/1.0',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Webhook error (${response.status}):`, errorText);
      } else {
        console.log(`Email successfully forwarded for: ${recipient}`);
      }
    } catch (err) {
      console.error('Fatal error processing incoming email in Cloudflare Worker:', err);
    }
  },
};
