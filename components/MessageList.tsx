'use client';

import React, { useState } from 'react';
import {
  Inbox,
  Mail,
  MailOpen,
  ChevronDown,
  ChevronUp,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { EmailMessage } from './MessageReader';
import { formatEmailBody, formatDateWIB, formatTimeAgo } from '@/lib/formatters';

interface MessageListProps {
  messages: EmailMessage[];
  currentEmail: string;
  onOpenSplitView: () => void;
  onSelectMessageForSplit: (message: EmailMessage) => void;
  onDeleteMessage: (id: string) => void;
  onClearAll: () => void;
}

export default function MessageList({
  messages,
  currentEmail,
  onOpenSplitView,
  onSelectMessageForSplit,
  onDeleteMessage,
  onClearAll,
}: MessageListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="brutal-card overflow-hidden bg-[var(--card-bg)]">
      {/* Header bar of inbox card with Electric Sky Blue & Cyber Yellow */}
      <div className="bg-[#f0f9ff] dark:bg-zinc-900 border-b-[2.5px] sm:border-b-[3.5px] border-[var(--border-color)] px-3 xs:px-4 py-2.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 sm:gap-3 select-none">
        <div className="font-mono-custom font-bold text-xs sm:text-sm flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--color-blue)] border-2 border-[var(--border-color)] flex items-center justify-center text-white flex-shrink-0 shadow-[1.5px_1.5px_0px_var(--shadow-color)] sm:shadow-[2px_2px_0px_var(--shadow-color)]">
            <Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[var(--text-muted)] font-black flex-shrink-0">INBOX:</span>
          <span className="text-[var(--color-blue)] font-black break-all">
            {currentEmail || '...'}
          </span>
          {/* Animated radar dot */}
          <span className="relative flex items-center justify-center w-2.5 h-2.5 flex-shrink-0 ml-1">
            <span className="motion-radar-ring" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
          </span>
        </div>

        <div className="flex items-center gap-1.5 xs:gap-2 justify-end flex-wrap">
          {messages.length > 0 && (
            <button
              onClick={onClearAll}
              className="brutal-btn bg-[var(--color-red)] text-white px-2 xs:px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] xs:text-[11px] font-bold font-mono-custom flex items-center gap-1 hover:bg-red-600 group shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
              title="Kosongkan semua pesan di inbox ini"
            >
              <Trash2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 group-hover:rotate-12 transition-transform flex-shrink-0" />
              <span className="hidden xs:inline">BERSIHKAN</span>
            </button>
          )}

          {/* BUKA SPLIT VIEW */}
          <button
            onClick={onOpenSplitView}
            className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 px-2.5 xs:px-3 sm:px-3.5 py-1 sm:py-1.5 text-[10px] xs:text-[11px] sm:text-xs font-bold font-mono-custom flex items-center gap-1 sm:gap-1.5 group shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
          >
            <ExternalLink className="w-3 h-3 xs:w-3.5 xs:h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            <span>SPLIT INBOX</span>
          </button>

          {/* Message Count Badge */}
          <div className="text-[10px] xs:text-[11px] sm:text-xs font-black font-mono-custom bg-[var(--color-yellow)] text-black border-2 border-[var(--border-color)] px-2 xs:px-2.5 py-0.5 sm:py-1 shadow-[1.5px_1.5px_0px_var(--shadow-color)] whitespace-nowrap">
            <span>{messages.length}</span> PESAN
          </div>
        </div>
      </div>

      {/* Message List Body */}
      <div className="p-3 xs:p-3.5 sm:p-5 bg-[var(--card-bg)] min-h-[220px] sm:min-h-[260px] flex flex-col space-y-3 sm:space-y-3.5">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-7 sm:py-10">
            {/* Animated Radar Antenna & Floating Mailbox Beacon */}
            <div className="relative mb-4 sm:mb-5">
              {/* Outer Radar Pulse Wave */}
              <div className="absolute -inset-4 sm:-inset-6 rounded-full border-2 border-dashed border-[var(--color-green)] opacity-40 motion-radar-sweep pointer-events-none" />
              <div className="absolute -inset-2 sm:-inset-3 rounded-full bg-[var(--color-green)] opacity-15 motion-pulse-dot pointer-events-none" />

              {/* Central Floating Neo-Brutalist Mailbox */}
              <div className="relative w-14 h-14 sm:w-18 sm:h-18 bg-[var(--color-yellow)] border-[2.5px] sm:border-[3px] border-[var(--border-color)] flex items-center justify-center shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)] motion-float z-10">
                <MailOpen className="w-7 h-7 sm:w-9 sm:h-9 text-black" />
                {/* Active Sonar Beacon Indicator on Corner */}
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--color-green)] border-2 border-[var(--border-color)] rounded-full flex items-center justify-center shadow-[1px_1px_0px_var(--shadow-color)]">
                  <span className="w-1.5 h-1.5 bg-white rounded-full motion-pulse-dot" />
                </div>
              </div>
            </div>

            {/* Live INBOX READY Status Pill with Signal Equalizer */}
            <div className="inline-flex items-center gap-2 brutal-badge bg-[#ecfdf5] dark:bg-emerald-950 text-[#065f46] dark:text-[#6ee7b7] px-3 py-1 sm:py-1.5 text-[10px] xs:text-xs font-mono-custom font-black border-2 border-[var(--border-color)] mb-2 sm:mb-2.5 motion-live-badge">
              <div className="flex items-end gap-0.5 h-2.5 flex-shrink-0">
                <span className="w-1 bg-[var(--color-green)] rounded-full signal-bar-1" />
                <span className="w-1 bg-[var(--color-green)] rounded-full signal-bar-2" />
                <span className="w-1 bg-[var(--color-green)] rounded-full signal-bar-3" />
              </div>
              <span className="tracking-wide">INBOX READY &bull; STANDBY</span>
            </div>

            <h3 className="font-heading text-sm xs:text-base sm:text-lg md:text-xl font-black uppercase tracking-tight mb-1 text-[var(--text-main)]">
              MENUNGGU PESAN MASUK
            </h3>
            <p className="font-mono-custom text-[11px] xs:text-xs text-[var(--text-muted)] max-w-xs sm:max-w-sm leading-relaxed px-2">
              Kirim email ke alamat di atas. Pesan atau kode OTP akan otomatis muncul di sini dalam 3 detik.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isExpanded = expandedId === msg.id;
            const formattedHtml = formatEmailBody(msg.bodyHtml || msg.bodyText);

            return (
              <div
                key={msg.id}
                className="border-[2.5px] sm:border-[3px] border-[var(--border-color)] bg-white dark:bg-zinc-900 shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)] hover:shadow-[5px_5px_0px_var(--shadow-color)] transition-all motion-scale-in"
              >
                <div className="p-3 xs:p-3.5 sm:p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 sm:gap-3">
                  {/* Summary Details */}
                  <div
                    onClick={() => toggleExpand(msg.id)}
                    className="min-w-0 flex-1 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1.5 xs:gap-2 mb-1 flex-wrap">
                      {!msg.isRead && (
                        <span className="bg-[var(--color-yellow)] text-black text-[9px] xs:text-[10px] font-mono-custom font-black px-1.5 xs:px-2 py-0.5 border-2 border-[var(--border-color)] uppercase shadow-[1px_1px_0px_var(--shadow-color)] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-red)] motion-pulse-dot flex-shrink-0" />
                          BARU
                        </span>
                      )}
                      <h4 className="font-black font-mono-custom text-xs sm:text-sm text-[var(--color-blue)] truncate max-w-[200px] xs:max-w-[260px] sm:max-w-none">
                        {msg.sender}
                      </h4>
                      <span className="text-[9px] xs:text-[10px] font-mono-custom font-bold bg-[#f1f5f9] dark:bg-zinc-800 text-[var(--text-muted)] px-1.5 xs:px-2 py-0.5 border border-[var(--border-color)] ml-auto sm:ml-0 flex-shrink-0">
                        {formatTimeAgo(msg.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs xs:text-sm sm:text-base font-black text-[var(--text-main)] truncate uppercase">
                      {msg.subject || '(Tanpa Subjek)'}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                      <span className="text-[9px] xs:text-[10px] font-mono-custom border border-[var(--border-color)] sm:border-2 inline-flex items-center gap-1 px-1.5 xs:px-2 py-0.5 bg-[#ecfdf5] dark:bg-emerald-950 text-[var(--color-green)] font-black">
                        <Clock className="w-2.5 h-2.5 xs:w-3 xs:h-3 flex-shrink-0" />
                        {formatDateWIB(msg.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Split / Baca / Hapus */}
                  <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t border-dashed sm:border-0 border-[var(--border-color)] w-full sm:w-auto">
                    <button
                      onClick={() => {
                        onSelectMessageForSplit(msg);
                        onOpenSplitView();
                      }}
                      className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-2.5 xs:px-3 py-1.5 sm:py-2 text-[11px] xs:text-xs font-mono-custom font-bold flex items-center justify-center gap-1 group flex-1 sm:flex-none shadow-[2px_2px_0px_var(--shadow-color)]"
                      title="Buka di tampilan layar penuh"
                    >
                      <ExternalLink className="w-3 h-3 xs:w-3.5 xs:h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                      <span>SPLIT</span>
                    </button>

                    {/* Tombol BACA / TUTUP */}
                    <button
                      onClick={() => toggleExpand(msg.id)}
                      className={`brutal-btn text-white px-3 xs:px-4 py-1.5 sm:py-2 text-[11px] xs:text-xs flex items-center justify-center gap-1.5 flex-2 sm:flex-none group shadow-[2px_2px_0px_var(--shadow-color)] ${
                        isExpanded
                          ? 'bg-[var(--color-red)] hover:bg-red-600'
                          : 'bg-[var(--color-green)] hover:bg-emerald-600'
                      }`}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-y-0.5 transition-transform flex-shrink-0" />
                          <span>TUTUP</span>
                        </>
                      ) : (
                        <>
                          <MailOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                          <span>BACA</span>
                        </>
                      )}
                    </button>

                    {/* Tombol HAPUS */}
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-600 px-2.5 py-1.5 sm:py-2 text-xs group flex-shrink-0 shadow-[2px_2px_0px_var(--shadow-color)]"
                      title="Hapus email ini"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Expanded Inline Accordion Preview */}
                {isExpanded && (
                  <div className="border-t-[2.5px] sm:border-t-[3px] border-[var(--border-color)] bg-[#f8fafc] dark:bg-zinc-950 p-2.5 xs:p-3 sm:p-5">
                    <iframe
                      title={`Inline Message ${msg.id}`}
                      srcDoc={formattedHtml}
                      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                      className="w-full min-h-[260px] xs:min-h-[300px] sm:min-h-[380px] md:min-h-[440px] border-[2.5px] sm:border-[3px] border-[var(--border-color)] bg-white shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)]"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer info with Animated Live Radar Beacon */}
      <div className="p-2.5 sm:p-3 text-center border-t-[2px] sm:border-t-[2.5px] border-dashed border-[var(--border-color)] text-[10px] xs:text-[11px] font-mono-custom font-black text-[var(--text-muted)] uppercase flex items-center justify-center gap-2 select-none">
        <div className="relative flex items-center justify-center w-2.5 h-2.5 flex-shrink-0">
          <span className="motion-radar-ring" />
          <span className="relative w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
        </div>
        <span className="truncate">HeyFlatimo Engine &bull; Realtime Inbox Listening</span>
      </div>
    </div>
  );
}
