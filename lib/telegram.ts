/**
 * Telegram Bot API Helper for HeyFlatimo Temp Mail
 * Features:
 * - HTML message formatting (Bold Title + <blockquote>Quote</blockquote> content)
 * - Interactive Inline Keyboard buttons
 * - Webhook registration & Bot verification
 */

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

/**
 * Validates bot token format (e.g. 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
 */
export function isValidBotToken(token: string): boolean {
  if (!token) return false;
  return /^\d{8,12}:[a-zA-Z0-9_-]{35,}$/.test(token.trim());
}

/**
 * Escapes HTML characters for safe rendering in Telegram HTML parse_mode
 */
export function escapeTelegramHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Formats a message with Bold Title and Quote content as requested by user
 */
export function formatTelegramMessage(
  title: string,
  content: string,
  meta?: { email?: string; sender?: string; time?: string; extra?: string }
): string {
  let message = `<b>${title}</b>\n\n`;

  if (meta) {
    if (meta.email) {
      message += `📧 <b>Email:</b> <code>${escapeTelegramHtml(meta.email)}</code>\n`;
    }
    if (meta.sender) {
      message += `👤 <b>Pengirim:</b> ${escapeTelegramHtml(meta.sender)}\n`;
    }
    if (meta.time) {
      message += `🕒 <b>Waktu:</b> ${escapeTelegramHtml(meta.time)}\n`;
    }
    if (meta.extra) {
      message += `${meta.extra}\n`;
    }
    message += '\n';
  }

  // Isi Judul / Konten dalam blockquote (quote styling di Telegram)
  message += `<blockquote>${content}</blockquote>`;

  return message;
}

/**
 * Send a message via Telegram Bot API
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: number | string,
  text: string,
  options: {
    parse_mode?: 'HTML' | 'MarkdownV2' | 'Markdown';
    reply_markup?: InlineKeyboardMarkup;
    disable_web_page_preview?: boolean;
  } = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const cleanToken = botToken.trim();
    if (!cleanToken) return { success: false, error: 'Bot token is empty' };

    const url = `${TELEGRAM_API_BASE}${cleanToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode || 'HTML',
        reply_markup: options.reply_markup,
        disable_web_page_preview: options.disable_web_page_preview ?? true,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      return { success: false, error: data.description || 'Telegram API error', data };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error to Telegram' };
  }
}

/**
 * Answer callback query from inline buttons
 */
export async function answerTelegramCallbackQuery(
  botToken: string,
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false
): Promise<boolean> {
  try {
    const cleanToken = botToken.trim();
    if (!cleanToken) return false;

    const url = `${TELEGRAM_API_BASE}${cleanToken}/answerCallbackQuery`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });

    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.error('Error answering callback query:', err);
    return false;
  }
}

/**
 * Get Bot Info (getMe) to verify bot token
 */
export async function getTelegramBotInfo(botToken: string): Promise<{ success: boolean; bot?: any; error?: string }> {
  try {
    const cleanToken = botToken.trim();
    if (!cleanToken) return { success: false, error: 'Bot token is empty' };

    const url = `${TELEGRAM_API_BASE}${cleanToken}/getMe`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.ok) {
      return { success: false, error: data.description || 'Invalid token' };
    }
    return { success: true, bot: data.result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch bot info' };
  }
}

/**
 * Register Webhook URL with Telegram Bot API
 */
export async function setTelegramWebhook(
  botToken: string,
  webhookUrl: string
): Promise<{ success: boolean; error?: string; description?: string }> {
  try {
    const cleanToken = botToken.trim();
    if (!cleanToken) return { success: false, error: 'Bot token is empty' };

    const url = `${TELEGRAM_API_BASE}${cleanToken}/setWebhook`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      return { success: false, error: data.description || 'Failed to set webhook' };
    }
    return { success: true, description: data.description };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error while setting webhook' };
  }
}

/**
 * Remove Webhook from Telegram Bot API
 */
export async function deleteTelegramWebhook(botToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanToken = botToken.trim();
    if (!cleanToken) return { success: false, error: 'Bot token is empty' };

    const url = `${TELEGRAM_API_BASE}${cleanToken}/deleteWebhook`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drop_pending_updates: true }),
    });

    const data = await res.json();
    if (!data.ok) {
      return { success: false, error: data.description || 'Failed to delete webhook' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error while deleting webhook' };
  }
}
