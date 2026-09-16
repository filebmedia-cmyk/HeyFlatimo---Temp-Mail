'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Inbox,
  Mail,
  Trash2,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import MessageReader, { EmailMessage } from './MessageReader';
import { formatDateWIB, formatTimeAgo } from '@/lib/formatters';

interface SplitInboxProps {
  currentEmail: string;
  messages: EmailMessage[];
  selectedMessage: EmailMessage | null;
  onSelectMessage: (msg: EmailMessage) => void;
  onBackToHome: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onDeleteMessage: (id: string) => void;
  onClearAll: () => void;
  onCopyText: (text: string) => void;
}

export default function SplitInbox({
  currentEmail,
  messages,
  selectedMessage,
  onSelectMessage,
  onBackToHome,
  onRefresh,
  isRefreshing,
  onDeleteMessage,
  onClearAll,
  onCopyText,
}: SplitInboxProps) {
  const [mobileShowReader, setMobileShowReader] = useState<boolean>(Boolean(selectedMessage));

  // Auto-switch to reader on mobile when a message is selected
  useEffect(() => {
    if (selectedMessage) {
      setMobileShowReader(true);
    }
  }, [selectedMessage]);

  const handleMessageClick = (msg: EmailMessage) => {
    onSelectMessage(msg);
    setMobileShowReader(true);
  };

  const handleMobileBack = () => {
    setMobileShowReader(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-color)] flex flex-col h-full h-[100dvh] min-h-[100dvh] overflow-hidden safe-top safe-bottom">
      {/* Top Navbar Header (Visible on Desktop, or on Mobile only when viewing Message List) */}
      <header
        className={`border-b-[2.5px] sm:border-b-[3.5px] border-[var(--border-color)] bg-[var(--card-bg)] justify-between items-center px-3 xs:px-4 sm:px-6 py-2 sm:py-2.5 flex-shrink-0 shadow-[0px_2px_0px_var(--shadow-color)] sm:shadow-[0px_3px_0px_var(--shadow-color)] z-20 ${
          mobileShowReader ? 'hidden md:flex' : 'flex'
        }`}
      >
        <button
          onClick={onBackToHome}
          className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 group shadow-[2px_2px_0px_var(--shadow-color)]"
          title="Kembali ke tampilan Beranda"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform flex-shrink-0" />
          <span className="hidden xs:inline">BERANDA</span>
          <span className="xs:hidden">HOME</span>
        </button>

        {/* Current Email Badge with Animated Beacon */}
        <div className="flex flex-col items-center mx-1 xs:mx-2 overflow-hidden max-w-[160px] xs:max-w-[220px] sm:max-w-md select-none">
          <span className="font-heading font-black text-xs xs:text-sm sm:text-base truncate w-full text-center text-[var(--color-blue)] uppercase">
            {currentEmail}
          </span>
          <div className="flex items-center gap-1.5 text-[8px] xs:text-[9px] font-mono-custom bg-[#ecfdf5] dark:bg-emerald-950 text-[#065f46] dark:text-[#6ee7b7] px-2 py-0.2 mt-0.5 border border-[var(--border-color)] font-black truncate motion-live-badge">
            <span className="relative flex items-center justify-center w-2 h-2 flex-shrink-0">
              <span className="motion-radar-ring" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
            </span>
            <span>INBOX READY &bull; {messages.length} PESAN</span>
          </div>
        </div>

        {/* Refresh & Clear Controls */}
        <div className="flex items-center gap-1.5 xs:gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearAll}
              className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-600 px-2 xs:px-2.5 py-1.5 text-xs hidden sm:flex items-center gap-1 group shadow-[2px_2px_0px_var(--shadow-color)]"
              title="Bersihkan Semua Pesan"
            >
              <Trash2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-bold font-mono-custom">BERSIHKAN</span>
            </button>
          )}

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 w-8 h-8 xs:w-9 xs:h-9 sm:w-9 sm:h-9 flex items-center justify-center group shadow-[2px_2px_0px_var(--shadow-color)]"
            title="Refresh Inbox"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${
                isRefreshing ? 'animate-spin-fast' : 'group-hover:rotate-180'
              }`}
            />
          </button>
        </div>
      </header>

      {/* Main Split Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Left Sidebar: Message List */}
        <div
          className={`w-full md:w-5/12 lg:w-4/12 xl:w-[32%] border-r-0 md:border-r-[3px] lg:border-r-[3.5px] border-[var(--border-color)] bg-[#f8fafc] dark:bg-zinc-900 flex flex-col overflow-y-auto touch-scroll ios-momentum-scroll ${
            mobileShowReader ? 'hidden md:flex' : 'flex'
          }`}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center opacity-75 my-auto select-none">
              <div className="relative mb-4 flex items-center justify-center">
                <div className="absolute w-16 sm:w-20 h-24 sm:h-28 rounded-full border-2 border-amber-300/50 dark:border-amber-700/40 pointer-events-none -translate-x-2 -translate-y-1.5" />
                <div className="absolute w-16 sm:w-20 h-24 sm:h-28 rounded-full border-2 border-amber-300/50 dark:border-amber-700/40 pointer-events-none translate-x-2 translate-y-1.5" />
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[var(--color-yellow)] border-[2.5px] sm:border-[3px] border-[var(--border-color)] flex items-center justify-center shadow-[3px_3px_0px_var(--shadow-color)] relative z-10">
                  <Inbox className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                </div>
              </div>
              <p className="font-heading font-black text-sm uppercase mb-1 text-[var(--text-main)]">
                Inbox Masih Kosong
              </p>
              <p className="font-mono-custom text-[11px] text-[var(--text-muted)] max-w-[220px]">
                Belum ada email masuk. Kirim email atau minta kode verifikasi ke alamat ini.
              </p>
            </div>
          ) : (
            <div className="divide-y-[2px] sm:divide-y-[2.5px] divide-[var(--border-color)]">
              {messages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleMessageClick(msg)}
                    className={`motion-message-item p-3 xs:p-3.5 sm:p-4 cursor-pointer transition-all group select-none active:scale-[0.99] ${
                      isSelected
                        ? 'bg-[var(--color-blue)] text-white border-l-[6px] sm:border-l-[8px] border-l-[var(--color-yellow)]'
                        : 'bg-white dark:bg-zinc-900 hover:bg-[#f1f5f9] dark:hover:bg-zinc-800 text-[var(--text-main)]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span
                        className={`font-black font-mono-custom text-xs truncate ${
                          isSelected
                            ? 'text-[var(--color-yellow)]'
                            : 'text-[var(--color-blue)]'
                        }`}
                      >
                        {msg.sender}
                      </span>
                      <span
                        className={`text-[9px] font-mono-custom font-black px-1.5 py-0.2 border border-[var(--border-color)] flex-shrink-0 ${
                          isSelected
                            ? 'bg-[var(--color-yellow)] text-black'
                            : 'bg-[#f1f5f9] dark:bg-zinc-800 text-[var(--text-muted)]'
                        }`}
                      >
                        {formatTimeAgo(msg.createdAt)}
                      </span>
                    </div>

                    <div
                      className={`font-heading font-black text-xs sm:text-sm truncate uppercase ${
                        isSelected ? 'text-white' : 'text-[var(--text-main)]'
                      }`}
                    >
                      {msg.subject || '(Tanpa Subjek)'}
                    </div>

                    <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-dashed border-current/20 text-[9px] font-mono-custom">
                      <span className="opacity-90 truncate font-bold">
                        {formatDateWIB(msg.createdAt)}
                      </span>
                      {!msg.isRead && !isSelected && (
                        <span className="bg-[var(--color-yellow)] text-black px-1.5 py-0.2 border border-[var(--border-color)] font-black uppercase">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Reader Panel */}
        <div
          className={`flex-1 min-h-0 flex flex-col bg-[var(--bg-color)] overflow-hidden ${
            mobileShowReader ? 'flex' : 'hidden md:flex'
          }`}
        >
          <MessageReader
            message={selectedMessage}
            onBack={handleMobileBack}
            onDelete={(id) => {
              onDeleteMessage(id);
              if (selectedMessage?.id === id) {
                setMobileShowReader(false);
              }
            }}
            onCopyText={onCopyText}
          />
        </div>
      </div>
    </div>
  );
}
