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
import { playSound, playKatanaSlashSound, playNekoSound, playShibaSound } from '@/lib/sound';

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

  // Interactive Squad Character States
  const [giyuState, setGiyuState] = useState<'idle' | 'slashing'>('idle');
  const [nekoState, setNekoState] = useState<'idle' | 'meow'>('idle');
  const [shibaState, setShibaState] = useState<'idle' | 'bark'>('idle');

  const handleGiyuClick = () => {
    if (giyuState === 'slashing') return;
    setGiyuState('slashing');
    playKatanaSlashSound(true);
    setTimeout(() => {
      setGiyuState('idle');
    }, 1400);
  };

  const handleNekoClick = () => {
    if (nekoState === 'meow') return;
    setNekoState('meow');
    playNekoSound(true);
    setTimeout(() => {
      setNekoState('idle');
    }, 1200);
  };

  const handleShibaClick = () => {
    if (shibaState === 'bark') return;
    setShibaState('bark');
    playShibaSound(true);
    setTimeout(() => {
      setShibaState('idle');
    }, 1200);
  };

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
        className={`border-b-[2.5px] sm:border-b-[3.5px] border-[var(--border-color)] bg-[var(--card-bg)] justify-between items-center px-2 xs:px-3 sm:px-6 py-1.5 xs:py-2 sm:py-2.5 flex-shrink-0 shadow-[0px_2px_0px_var(--shadow-color)] sm:shadow-[0px_3px_0px_var(--shadow-color)] z-20 w-full max-w-full overflow-hidden ${
          mobileShowReader ? 'hidden md:flex' : 'flex'
        }`}
      >
        <button
          onClick={onBackToHome}
          className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 group shadow-[2px_2px_0px_var(--shadow-color)]"
          title="Kembali ke Tampilan Utama"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-mono-custom font-black">KEMBALI</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[var(--color-blue)] border border-[var(--border-color)] flex items-center justify-center text-white flex-shrink-0 shadow-[1px_1px_0px_var(--shadow-color)]">
            <Inbox className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <span className="text-[11px] xs:text-xs sm:text-sm font-mono-custom font-bold text-[var(--color-blue)] truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
            {currentEmail || 'Memuat...'}
          </span>
          <span className="relative flex items-center justify-center w-2 h-2 flex-shrink-0">
            <span className="motion-radar-ring" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Bersihkan Semua button */}
          {messages.length > 0 && (
            <button
              onClick={onClearAll}
              className="brutal-btn bg-[var(--color-red)] text-white hover:bg-red-600 px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1 group shadow-[2px_2px_0px_var(--shadow-color)]"
              title="Kosongkan Semua Pesan"
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
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center my-auto select-none">
              {/* Squad Diorama in Split Inbox */}
              <div className="relative mb-3 flex items-end justify-center gap-2 select-none">
                {/* Neko */}
                <div
                  onClick={handleNekoClick}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleNekoClick();
                  }}
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  className={`flex flex-col items-center anim-char-bob cursor-pointer group transition-transform ${
                    nekoState === 'meow' ? '-translate-y-1.5' : ''
                  }`}
                  title="Neko Gamer"
                >
                  <div className="bg-[#ff007f] text-white font-pixel text-[5px] px-1 py-0.2 border border-black shadow-[1px_1px_0px_#000] -mb-1 z-10 font-bold">
                    {nekoState === 'meow' ? 'PURR!' : 'MEOW!'}
                  </div>
                  <svg width="34" height="34" viewBox="0 0 32 32" className="drop-shadow-[1.5px_1.5px_0px_#000]">
                    <g className="anim-tail">
                      <rect x="23" y="16" width="3" height="3" fill="#ff9900" stroke="#000" strokeWidth="0.75" />
                    </g>
                    <polygon points="7,4 12,4 7,10" fill="#ff9900" stroke="#000" strokeWidth="0.8" />
                    <polygon points="25,4 20,4 25,10" fill="#ff9900" stroke="#000" strokeWidth="0.8" />
                    <rect x="8" y="8" width="16" height="11" rx="2" fill="#ff9900" stroke="#000" strokeWidth="1" />
                    <rect x="10" y="11" width="3" height="3" fill="#000000" />
                    <rect x="19" y="11" width="3" height="3" fill="#000000" />
                    <rect x="10" y="18" width="12" height="9" fill="#ff9900" stroke="#000" strokeWidth="0.9" />
                  </svg>
                </div>

                {/* Giyu */}
                <div
                  onClick={handleGiyuClick}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleGiyuClick();
                  }}
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  className={`flex flex-col items-center relative cursor-pointer group ${
                    giyuState === 'slashing' ? 'anim-action-slash' : 'anim-char-bob'
                  }`}
                  title="Giyu Tomioka"
                >
                  <div className="bg-cyan-500 text-black font-pixel text-[5.5px] px-1.5 py-0.2 border border-black shadow-[1px_1px_0px_#000] -mb-1 z-30 font-bold">
                    {giyuState === 'slashing' ? 'SLASH!' : 'GIYU'}
                  </div>
                  <div className="relative">
                    <div className="absolute -inset-1 bg-cyan-400/25 blur-sm rounded-full anim-water" />
                    <svg width="48" height="48" viewBox="0 0 36 36" className="relative z-10 drop-shadow-[2px_2px_0px_#000]">
                      <polygon points="10,5 18,3 26,5 28,11 26,13 10,13 8,10" fill="#0f172a" stroke="#000" strokeWidth="0.9" />
                      <rect x="10" y="8" width="16" height="11" fill="#fde68a" stroke="#000" strokeWidth="1" />
                      <rect x="12" y="12" width="3" height="2.5" fill="#0284c7" />
                      <rect x="21" y="12" width="3" height="2.5" fill="#0284c7" />
                      <path d="M10,19 L18,19 L18,29 L8,29 L8,22 Z" fill="#b91c1c" stroke="#000" strokeWidth="0.9" />
                      <path d="M18,19 L26,19 L28,22 L28,29 L18,29 Z" fill="#15803d" stroke="#000" strokeWidth="0.9" />
                      {giyuState === 'idle' ? (
                        <line x1="5" y1="28" x2="14" y2="23" stroke="#0284c7" strokeWidth="1.5" />
                      ) : (
                        <line x1="18" y1="20" x2="32" y2="10" stroke="#00f0ff" strokeWidth="2.5" />
                      )}
                      <rect x="12" y="29" width="4" height="4" fill="#0f172a" />
                      <rect x="20" y="29" width="4" height="4" fill="#0f172a" />
                    </svg>
                  </div>
                </div>

                {/* Shiba */}
                <div
                  onClick={handleShibaClick}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleShibaClick();
                  }}
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', animationDelay: '-1.2s' }}
                  className={`flex flex-col items-center anim-char-bob cursor-pointer group transition-transform ${
                    shibaState === 'bark' ? '-translate-y-1.5' : ''
                  }`}
                  title="Shiba Mail Courier"
                >
                  <div className="bg-[#ffe600] text-black font-pixel text-[5px] px-1 py-0.2 border border-black shadow-[1px_1px_0px_#000] -mb-1 z-10 font-bold">
                    {shibaState === 'bark' ? 'WOOF!' : 'MAIL!'}
                  </div>
                  <svg width="34" height="34" viewBox="0 0 32 32" className="drop-shadow-[1.5px_1.5px_0px_#000]">
                    <polygon points="7,4 12,4 9,10" fill="#d97706" stroke="#000" strokeWidth="0.8" />
                    <polygon points="25,4 20,4 23,10" fill="#d97706" stroke="#000" strokeWidth="0.8" />
                    <rect x="8" y="10" width="16" height="11" fill="#d97706" stroke="#000" strokeWidth="0.9" rx="1" />
                    <rect x="10" y="13" width="2.5" height="2.5" fill="#000" />
                    <rect x="19.5" y="13" width="2.5" height="2.5" fill="#000" />
                    <rect x="11" y="19" width="10" height="5" fill="#ffffff" stroke="#000" strokeWidth="0.7" />
                  </svg>
                </div>
              </div>

              <p className="font-heading font-black text-sm uppercase mb-1 text-[var(--text-main)]">
                Inbox Masih Kosong
              </p>
              <p className="font-mono-custom text-[10px] text-[var(--text-muted)] max-w-[200px]">
                Belum ada email masuk. Kirim email ke alamat di atas.
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
