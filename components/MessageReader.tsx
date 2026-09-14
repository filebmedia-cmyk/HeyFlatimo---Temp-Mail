'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Trash2,
  Copy,
  Check,
  Code,
  Eye,
  Mail,
  Clock,
  User,
  Inbox,
} from 'lucide-react';
import { formatEmailBody, formatDateWIB, escapeHtml } from '@/lib/formatters';

export interface EmailMessage {
  id: string;
  recipient: string;
  sender: string;
  senderName?: string;
  senderAddress?: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  isRead: boolean;
  createdAt: string | Date;
  expiresAt?: string | Date;
  attachments?: Array<{ filename: string; contentType: string; size: number }>;
}

interface MessageReaderProps {
  message: EmailMessage | null;
  onBack?: () => void;
  onDelete: (id: string) => void;
  onCopyText: (text: string) => void;
}

export default function MessageReader({
  message,
  onBack,
  onDelete,
  onCopyText,
}: MessageReaderProps) {
  const [viewRaw, setViewRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!message) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--card-bg)] min-h-[400px]">
        <div className="w-16 h-16 bg-[var(--color-yellow)] border-[3px] border-[var(--border-color)] flex items-center justify-center mb-4 shadow-[4px_4px_0px_var(--shadow-color)] motion-float">
          <Inbox className="w-8 h-8 text-black" />
        </div>
        <h3 className="font-heading font-black text-base sm:text-lg uppercase tracking-wider mb-1 text-[var(--text-main)]">
          PILIH PESAN UNTUK DIBACA
        </h3>
        <p className="font-mono-custom text-xs text-[var(--text-muted)] max-w-xs">
          Klik salah satu pesan di sebelah kiri untuk melihat isi lengkapnya.
        </p>
      </div>
    );
  }

  const handleCopyBody = () => {
    const content = message.bodyText || message.bodyHtml || '';
    onCopyText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedHtml = formatEmailBody(message.bodyHtml || message.bodyText);

  return (
    <div className="flex-1 flex flex-col bg-[var(--card-bg)] h-full overflow-hidden border-0 md:border-l-[3px] sm:border-l-[4px] border-[var(--border-color)]">
      {/* Reader Top Header Bar */}
      <div className="border-b-[2.5px] sm:border-b-[3.5px] border-[var(--border-color)] bg-[#f8fafc] dark:bg-zinc-900 p-3 xs:p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 flex-shrink-0">
        {/* Mobile Back Button & Action Controls */}
        <div className="flex items-center justify-between gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="brutal-btn bg-[var(--color-yellow)] text-black px-2.5 xs:px-3 py-1.5 text-xs flex items-center gap-1 md:hidden group shadow-[2px_2px_0px_var(--shadow-color)]"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform flex-shrink-0" />
              <span>DAFTAR PESAN</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 xs:gap-2 ml-auto">
            {/* Toggle Raw Text / HTML */}
            <button
              onClick={() => setViewRaw(!viewRaw)}
              className="brutal-btn bg-[var(--color-orange)] text-white hover:bg-orange-600 px-2.5 xs:px-3 py-1.5 text-xs flex items-center gap-1 font-mono-custom font-bold group shadow-[2px_2px_0px_var(--shadow-color)]"
              title={viewRaw ? 'Tampilkan Mode HTML' : 'Tampilkan Plain Text'}
            >
              {viewRaw ? (
                <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform flex-shrink-0" />
              ) : (
                <Code className="w-3.5 h-3.5 group-hover:scale-110 transition-transform flex-shrink-0" />
              )}
              <span className="hidden sm:inline">{viewRaw ? 'PREVIEW' : 'RAW'}</span>
            </button>

            {/* Copy Text Button */}
            <button
              onClick={handleCopyBody}
              className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 px-2.5 xs:px-3 py-1.5 text-xs flex items-center gap-1 font-mono-custom font-bold group shadow-[2px_2px_0px_var(--shadow-color)]"
              title="Salin isi teks email"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 group-hover:-rotate-12 transition-transform flex-shrink-0" />
              )}
              <span className="hidden sm:inline">{copied ? 'TERSALIN' : 'SALIN'}</span>
            </button>

            {/* Delete Message Button */}
            <button
              onClick={() => onDelete(message.id)}
              className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-600 px-2.5 xs:px-3 py-1.5 text-xs flex items-center gap-1 group shadow-[2px_2px_0px_var(--shadow-color)]"
              title="Hapus pesan ini"
            >
              <Trash2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform flex-shrink-0" />
              <span className="hidden sm:inline">HAPUS</span>
            </button>
          </div>
        </div>

        {/* Subject */}
        <h2 className="font-heading font-black text-sm xs:text-base sm:text-lg md:text-xl uppercase tracking-tight text-[var(--text-main)] break-words">
          {message.subject || '(Tanpa Subjek)'}
        </h2>

        {/* Sender & Date Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t-[2px] sm:border-t-[2.5px] border-dashed border-[var(--border-color)] text-[11px] xs:text-xs font-mono-custom">
          <div className="flex items-center gap-1.5 text-[var(--text-main)] min-w-0">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-blue)] flex-shrink-0" />
            <span className="font-black truncate max-w-[200px] xs:max-w-[300px] sm:max-w-none">
              DARI: {message.sender}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[var(--text-muted)] flex-shrink-0">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--color-orange)]" />
            <span className="bg-[var(--color-yellow)] text-black border border-[var(--border-color)] sm:border-2 px-1.5 xs:px-2 py-0.5 font-black text-[10px] xs:text-[11px] shadow-[1.5px_1.5px_0px_var(--shadow-color)]">
              {formatDateWIB(message.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Email Body: Sandboxed Iframe or Raw View */}
      <div className="flex-1 p-2 xs:p-3 sm:p-4 overflow-hidden flex flex-col bg-[#f8fafc] dark:bg-zinc-950">
        {viewRaw ? (
          <div className="w-full h-full p-3 sm:p-4 bg-zinc-950 text-emerald-400 font-mono text-xs overflow-auto border-[2.5px] sm:border-[3px] border-[var(--border-color)] whitespace-pre-wrap select-text shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)]">
            {message.bodyText || message.bodyHtml || 'Tidak ada konten teks'}
          </div>
        ) : (
          <iframe
            title="Email Content Preview"
            srcDoc={formattedHtml}
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            className="w-full flex-1 bg-white border-[2.5px] sm:border-[3.5px] border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)]"
          />
        )}
      </div>
    </div>
  );
}
