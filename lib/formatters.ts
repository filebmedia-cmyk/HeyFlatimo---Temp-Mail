// Helper untuk memformat konten email & tanggal

export function escapeHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatEmailBody(rawBody?: string): string {
  if (!rawBody || rawBody.trim() === '') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #64748b; font-size: 14px; text-align: center; }
        </style>
      </head>
      <body>
        <p>(Tidak ada konten pesan)</p>
      </body>
      </html>
    `;
  }

  let html = rawBody;

  // Jika tidak terdeteksi tag HTML, format plain text menjadi HTML interaktif
  const hasHtmlTag = /<[a-z][\s\S]*>/i.test(html);
  if (!hasHtmlTag) {
    const escaped = escapeHtml(html);
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    html = escaped.replace(
      urlRegex,
      '<a href="$1" target="_blank" style="color:#4f46e5; font-weight:700; text-decoration:underline;">$1</a>'
    );
    html = html.replace(/\n/g, '<br>');
  }

  // Tambahkan base target _blank dan style dasar agar iframe tampil responsif & rapi
  const injectedStyle = `
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Work Sans", sans-serif; 
        line-height: 1.6; 
        color: #1e293b;
        word-break: break-word;
        margin: 0;
        padding: 16px;
      }
      a { color: #4f46e5; }
      img { max-width: 100%; height: auto; }
      table { max-width: 100% !important; }
    </style>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <base target="_blank">
      ${injectedStyle}
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;
}

export function formatDateWIB(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput);
    return d.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' WIB';
  } catch {
    return String(dateInput);
  }
}

export function formatTimeAgo(dateInput: string | Date): string {
  try {
    const diff = Math.floor((Date.now() - new Date(dateInput).getTime()) / 1000);
    if (diff < 5) return 'Baru saja';
    if (diff < 60) return `${diff}d lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  } catch {
    return '';
  }
}
