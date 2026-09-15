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
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Key,
} from 'lucide-react';
import { formatEmailBody, formatDateWIB, escapeHtml } from '@/lib/formatters';
import { extractOtp, extractLinks } from '@/lib/otpParser';

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

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
  const otpResult = extractOtp(message.bodyText, message.bodyHtml, message.subject);
  const linksResult = extractLinks(message.bodyText, message.bodyHtml);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

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

      {/* 1-Click Verification / Magic Link Detector & Quick OTP Banner */}
      {(otpResult.found || linksResult.found) && (
        <div className="bg-[#f0f9ff] dark:bg-zinc-900 border-b-[2.5px] sm:border-b-[3px] border-[var(--border-color)] p-2.5 xs:p-3 sm:p-4 space-y-2 flex-shrink-0">
          {/* Quick OTP Detection Bar */}
          {otpResult.found && otpResult.otp && (
            <div className="p-2.5 xs:p-3 bg-amber-50 dark:bg-amber-950/40 border-[2px] border-amber-400 dark:border-amber-600 flex flex-wrap items-center justify-between gap-2 shadow-[2px_2px_0px_var(--shadow-color)] motion-scale-in">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 bg-[var(--color-yellow)] text-black border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 shadow-[1px_1px_0px_var(--shadow-color)]">
                  <Zap className="w-4 h-4 text-black fill-black" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] xs:text-[10px] font-mono-custom font-black text-amber-700 dark:text-amber-300 uppercase block">
                    KODE OTP TERDETEKSI
                  </span>
                  <span className="font-mono-custom font-black text-base xs:text-lg sm:text-xl text-black dark:text-white tracking-widest select-all">
                    {otpResult.otp}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyOtp(otpResult.otp!)}
                className={`brutal-btn px-3 py-1.5 text-xs font-mono-custom font-black flex items-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)] ${
                  copiedOtp
                    ? 'bg-[var(--color-green)] text-white'
                    : 'bg-[var(--color-yellow)] text-black hover:bg-yellow-400'
                }`}
              >
                {copiedOtp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOtp ? 'TERSALIN' : 'SALIN OTP'}</span>
              </button>
            </div>
          )}

          {/* Magic Link Detector Callout */}
          {linksResult.found && linksResult.primaryLink && (
            <div className="p-3 bg-[#ecfdf5] dark:bg-emerald-950/50 border-[2.5px] border-[var(--color-green)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-[3px_3px_0px_var(--shadow-color)] motion-scale-in group">
              <div className="min-w-0 flex items-start gap-2.5">
                <div className="w-8 h-8 bg-[var(--color-green)] text-white border-2 border-[var(--border-color)] flex items-center justify-center flex-shrink-0 shadow-[1.5px_1.5px_0px_var(--shadow-color)]">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] xs:text-[11px] font-mono-custom font-black text-emerald-800 dark:text-emerald-300 uppercase">
                      1-CLICK VERIFICATION LINK
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  </div>
                  <p className="font-mono-custom text-[11px] xs:text-xs text-zinc-600 dark:text-zinc-300 truncate max-w-sm sm:max-w-md">
                    {linksResult.primaryLink}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyLink(linksResult.primaryLink!)}
                  className="brutal-btn bg-white dark:bg-zinc-800 text-black dark:text-white px-2.5 py-1.5 text-xs font-mono-custom font-bold flex items-center gap-1 shadow-[2px_2px_0px_var(--shadow-color)] hover:bg-zinc-100"
                  title="Salin URL Verifikasi"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[var(--color-green)]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden xs:inline">{copiedLink ? 'TERSALIN' : 'SALIN'}</span>
                </button>

                <a
                  href={linksResult.primaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-3.5 py-1.5 text-xs font-mono-custom font-black flex items-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)] cursor-pointer group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                >
                  <span>BUKA LINK</span>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

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
