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
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-[var(--card-bg)] min-h-[350px] select-none">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[var(--color-yellow)] border-[2.5px] sm:border-[3px] border-[var(--border-color)] flex items-center justify-center mb-3 sm:mb-4 shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)] motion-float">
          <Inbox className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
        </div>
        <h3 className="font-heading font-black text-sm sm:text-lg uppercase tracking-wider mb-1 text-[var(--text-main)]">
          PILIH PESAN UNTUK DIBACA
        </h3>
        <p className="font-mono-custom text-[11px] sm:text-xs text-[var(--text-muted)] max-w-xs mb-4">
          Klik salah satu pesan dari daftar email di sebelah kiri untuk melihat konten lengkapnya.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="brutal-btn bg-[var(--color-yellow)] text-black px-3.5 py-2 text-xs font-black md:hidden flex items-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>KEMBALI KE DAFTAR PESAN</span>
          </button>
        )}
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
    <div className="flex-1 flex flex-col bg-[var(--card-bg)] h-full min-h-0 overflow-hidden border-0 md:border-l-[3px] lg:border-l-[3.5px] border-[var(--border-color)]">
      {/* Reader Top Header Bar */}
      <div className="border-b-[2.5px] sm:border-b-[3.5px] border-[var(--border-color)] bg-[#f8fafc] dark:bg-zinc-900 p-2.5 xs:p-3 sm:p-4 flex flex-col gap-2 flex-shrink-0">
        {/* Mobile Back Button & Action Controls */}
        <div className="flex items-center justify-between gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-2.5 xs:px-3 py-1.5 text-[11px] xs:text-xs font-black flex items-center gap-1 md:hidden group shadow-[2px_2px_0px_var(--shadow-color)]"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform flex-shrink-0" />
              <span>DAFTAR PESAN</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono-custom font-black text-[var(--color-blue)] uppercase">
            <Mail className="w-4 h-4 anim-mail" />
            <span>BACA PESAN</span>
          </div>

          <div className="flex items-center gap-1.5 xs:gap-2 ml-auto">
            {/* Toggle Raw Text / HTML */}
            <button
              onClick={() => setViewRaw(!viewRaw)}
              className="brutal-btn bg-[var(--color-orange)] text-white hover:bg-orange-600 px-2.5 xs:px-3 py-1.5 text-[11px] xs:text-xs flex items-center gap-1 font-mono-custom font-bold group shadow-[2px_2px_0px_var(--shadow-color)]"
              title={viewRaw ? 'Tampilkan Mode HTML Preview' : 'Tampilkan Plain Text / Raw'}
            >
              {viewRaw ? (
                <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform flex-shrink-0" />
              ) : (
                <Code className="w-3.5 h-3.5 group-hover:scale-110 transition-transform flex-shrink-0 anim-terminal" />
              )}
              <span>{viewRaw ? 'PREVIEW' : 'RAW'}</span>
            </button>

            {/* Copy Text Button */}
            <button
              onClick={handleCopyBody}
              className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 px-2.5 xs:px-3 py-1.5 text-[11px] xs:text-xs flex items-center gap-1 font-mono-custom font-bold group shadow-[2px_2px_0px_var(--shadow-color)]"
              title="Salin isi teks email"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 group-hover:-rotate-12 transition-transform flex-shrink-0" />
              )}
              <span>{copied ? 'TERSALIN' : 'SALIN'}</span>
            </button>

            {/* Delete Message Button */}
            <button
              onClick={() => onDelete(message.id)}
              className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-600 px-2.5 xs:px-3 py-1.5 text-[11px] xs:text-xs flex items-center gap-1 group shadow-[2px_2px_0px_var(--shadow-color)]"
              title="Hapus pesan ini"
            >
              <Trash2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform flex-shrink-0 anim-trash" />
              <span className="hidden xs:inline">HAPUS</span>
            </button>
          </div>
        </div>

        {/* Subject */}
        <h2 className="font-heading font-black text-xs xs:text-sm sm:text-base md:text-lg uppercase tracking-tight text-[var(--text-main)] break-words line-clamp-2">
          {message.subject || '(Tanpa Subjek)'}
        </h2>

        {/* Sender & Date Info */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 border-t-[1.5px] sm:border-t-[2px] border-dashed border-[var(--border-color)] text-[10px] xs:text-[11px] sm:text-xs font-mono-custom">
          <div className="flex items-center gap-1.5 text-[var(--text-main)] min-w-0">
            <User className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-[var(--color-blue)] flex-shrink-0" />
            <span className="font-black truncate max-w-[180px] xs:max-w-[260px] sm:max-w-none">
              DARI: {message.sender}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[var(--text-muted)] flex-shrink-0 ml-auto sm:ml-0">
            <Clock className="w-3 h-3 text-[var(--color-orange)] flex-shrink-0 anim-clock" />
            <span className="bg-[var(--color-yellow)] text-black border border-[var(--border-color)] sm:border-2 px-1.5 py-0.2 font-black text-[9px] xs:text-[10px] sm:text-[11px] shadow-[1px_1px_0px_var(--shadow-color)]">
              {formatDateWIB(message.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* 1-Click Verification / Magic Link Detector & Quick OTP Banner */}
      {(otpResult.found || linksResult.found) && (
        <div className="bg-[#f0f9ff] dark:bg-zinc-900 border-b-[2px] sm:border-b-[3px] border-[var(--border-color)] p-2 xs:p-2.5 sm:p-3 space-y-2 flex-shrink-0">
          {/* Quick OTP Detection Bar */}
          {otpResult.found && otpResult.otp && (
            <div className="p-2 xs:p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-950/40 border-[2px] border-amber-400 dark:border-amber-600 flex flex-wrap items-center justify-between gap-2 shadow-[2px_2px_0px_var(--shadow-color)] motion-scale-in">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--color-yellow)] text-black border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 shadow-[1px_1px_0px_var(--shadow-color)]">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black fill-black anim-zap" />
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] xs:text-[9px] font-mono-custom font-black text-amber-700 dark:text-amber-300 uppercase block leading-none">
                    KODE OTP TERDETEKSI
                  </span>
                  <span className="font-mono-custom font-black text-sm xs:text-base sm:text-lg text-black dark:text-white tracking-widest select-all">
                    {otpResult.otp}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyOtp(otpResult.otp!)}
                className={`brutal-btn px-2.5 xs:px-3 py-1 text-[11px] xs:text-xs font-mono-custom font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] ${
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
            <div className="p-2 xs:p-2.5 sm:p-3 bg-[#ecfdf5] dark:bg-emerald-950/50 border-[2px] border-[var(--color-green)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[2px_2px_0px_var(--shadow-color)] motion-scale-in group">
              <div className="min-w-0 flex items-start gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--color-green)] text-white border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 shadow-[1px_1px_0px_var(--shadow-color)]">
                  <Sparkles className="w-3.5 h-3.5 text-white anim-sparkle" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] xs:text-[10px] font-mono-custom font-black text-emerald-800 dark:text-emerald-300 uppercase">
                      LINK VERIFIKASI
                    </span>
                    {linksResult.primaryLabel && (
                      <span className="bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 border border-emerald-500 text-[8px] xs:text-[9px] font-mono-custom font-black px-1.5 py-0.2 rounded-none">
                        &quot;{linksResult.primaryLabel}&quot;
                      </span>
                    )}
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0 anim-shield" />
                  </div>
                  <p className="font-mono-custom text-[10px] xs:text-[11px] text-zinc-600 dark:text-zinc-300 truncate max-w-[200px] xs:max-w-xs sm:max-w-sm">
                    {linksResult.primaryLink}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleCopyLink(linksResult.primaryLink!)}
                  className="brutal-btn bg-white dark:bg-zinc-800 text-black dark:text-white px-2 py-1 text-[11px] font-mono-custom font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] hover:bg-zinc-100"
                  title="Salin URL Verifikasi"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-[var(--color-green)]" /> : <Copy className="w-3 h-3" />}
                  <span className="hidden xs:inline">{copiedLink ? 'TERSALIN' : 'SALIN'}</span>
                </button>

                <a
                  href={linksResult.primaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-2.5 xs:px-3 py-1 text-[11px] font-mono-custom font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] cursor-pointer"
                >
                  <span>BUKA LINK</span>
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Body: Sandboxed Iframe or Raw View with iOS Momentum Scrolling */}
      <div className="flex-1 min-h-0 p-2 xs:p-2.5 sm:p-3 overflow-hidden flex flex-col bg-[#f8fafc] dark:bg-zinc-950">
        {viewRaw ? (
          <div className="w-full h-full min-h-0 p-2.5 sm:p-4 bg-zinc-950 text-emerald-400 font-mono text-[11px] sm:text-xs overflow-y-auto overflow-x-auto whitespace-pre-wrap select-text border-[2px] sm:border-[3px] border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)] touch-scroll ios-momentum-scroll">
            {message.bodyText || message.bodyHtml || 'Tidak ada konten teks'}
          </div>
        ) : (
          <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-scroll ios-momentum-scroll relative bg-white dark:bg-zinc-900 border-[2px] sm:border-[3px] border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)]">
            <iframe
              title="Email Content Preview"
              srcDoc={formattedHtml}
              sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              className="w-full h-full min-h-[300px] border-0 bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}
