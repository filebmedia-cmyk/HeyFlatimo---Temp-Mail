/**
 * Cloudflare Email Worker (Stand-alone Zero-Config / Browser Editor Version)
 *
 * Versi ini bisa langsung di-copy & paste ke editor online Cloudflare Workers di dashboard web
 * tanpa perlu instalasi npm build di komputer lokal.
 */

export default {
  async email(message, env, ctx) {
    try {
      const webhookUrl = env.WEBHOOK_URL || 'https://your-tmail.vercel.app';
      const webhookSecret = env.WEBHOOK_SECRET || '';

      const to = message.to;
      const from = message.from;
      const headers = Object.fromEntries(message.headers);
      const subject = headers['subject'] || '(Tanpa Subjek)';

      // Baca raw body dari email stream
      const rawStream = await new Response(message.raw).text();

      // Ekstrak teks dan HTML sederhana dari raw stream jika tidak menggunakan postal-mime
      let bodyText = '';
      let bodyHtml = '';

      if (rawStream.includes('Content-Type: text/html')) {
        const parts = rawStream.split(/--[a-zA-Z0-9_-]+/);
        for (const part of parts) {
          if (part.includes('Content-Type: text/html') || part.includes('text/html')) {
            const splitContent = part.split(/\r?\n\r?\n/);
            if (splitContent.length > 1) {
              bodyHtml = splitContent.slice(1).join('\n\n').trim();
            }
          } else if (part.includes('Content-Type: text/plain') || part.includes('text/plain')) {
            const splitContent = part.split(/\r?\n\r?\n/);
            if (splitContent.length > 1) {
              bodyText = splitContent.slice(1).join('\n\n').trim();
            }
          }
        }
      }

      // Fallback jika single part
      if (!bodyHtml && !bodyText) {
        const splitContent = rawStream.split(/\r?\n\r?\n/);
        bodyText = splitContent.length > 1 ? splitContent.slice(1).join('\n\n') : rawStream;
      }

      const payload = {
        to: to,
        from: from,
        subject: subject,
        text: bodyText,
        html: bodyHtml || `<pre style="font-family: monospace; white-space: pre-wrap;">${bodyText}</pre>`,
        headers: headers,
        rawSize: rawStream.length,
      };

      const endpoint = `${webhookUrl.replace(/\/+$/, '')}/api/webhook/email`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': webhookSecret,
          'User-Agent': 'Cloudflare-Email-Worker/1.0',
        },
        body: JSON.stringify(payload),
      });

      console.log(`Webhook sent to ${endpoint}, status: ${res.status}`);
    } catch (err) {
      console.error('Error in Email Worker:', err);
    }
  },
};
