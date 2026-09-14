'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Shuffle,
  SlidersHorizontal,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import CustomEmailModal from './CustomEmailModal';
import DomainDropdown from './DomainDropdown';

interface EmailCardProps {
  currentEmail: string;
  currentPrefix: string;
  currentDomain: string;
  availableDomains: string[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onRandomize: () => void;
  onChangeDomain: (domain: string) => void;
  onApplyCustom: (prefix: string, domain: string) => void;
  onCopy: (email: string) => void;
  countdownSeconds: number;
}

export default function EmailCard({
  currentEmail,
  currentPrefix,
  currentDomain,
  availableDomains,
  isRefreshing,
  onRefresh,
  onRandomize,
  onChangeDomain,
  onApplyCustom,
  onCopy,
  countdownSeconds,
}: EmailCardProps) {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopyClick = () => {
    if (!currentEmail) return;
    onCopy(currentEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="brutal-card p-4 xs:p-5 sm:p-7 mb-5 sm:mb-7 relative bg-[var(--card-bg)]">
      {/* Title Header: Clean, Balanced, No Emoji */}
      <div className="text-center mb-5 sm:mb-6">
        <div className="inline-flex items-center gap-1.5 brutal-badge bg-[var(--color-yellow)] text-black px-2.5 xs:px-3 py-0.5 sm:py-1 text-[10px] xs:text-[11px] mb-2 sm:mb-2.5 font-mono-custom uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-orange)] icon-wiggle" />
          <span>DISPOSABLE INBOX SYSTEM</span>
        </div>
        <h1 className="font-heading text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[var(--text-main)] mb-1.5 sm:mb-2">
          TEMPORARY <span className="text-[var(--color-blue)]">INBOX</span>
        </h1>
        <p className="text-[var(--text-muted)] font-mono-custom text-[11px] xs:text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          Terima kode OTP & verifikasi instan. Otomatis terhapus, aman & tanpa data pribadi.
        </p>
      </div>

      {/* Main Email Input Display + Copy Button */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-5 sm:mb-6">
        <div className="relative flex-1 group min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-blue)] group-hover:scale-110 transition-transform flex-shrink-0" />
          </div>
          <input
            type="text"
            readOnly
            value={currentEmail || 'Memuat alamat email...'}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="brutal-input w-full font-mono-custom text-xs xs:text-sm sm:text-base md:text-lg py-2.5 xs:py-3 sm:py-3.5 pl-9 xs:pl-10 sm:pl-11 pr-3 sm:pr-4 font-bold text-center sm:text-left select-all cursor-pointer bg-white dark:bg-zinc-900 border-[2.5px] sm:border-[3.5px] border-[var(--border-color)] truncate"
          />
        </div>

        {/* Tombol SALIN */}
        <button
          onClick={handleCopyClick}
          className={`brutal-btn px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-3.5 text-xs xs:text-sm sm:text-base flex items-center justify-center gap-2 group shadow-[2.5px_2.5px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)] ${
            copied
              ? 'bg-[var(--color-green)] text-white'
              : 'bg-[var(--color-blue)] text-white hover:bg-sky-600'
          }`}
          title="Salin ke Clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 sm:w-5 sm:h-5 icon-bounce" />
              <span>TERSALIN!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform" />
              <span>SALIN</span>
            </>
          )}
        </button>
      </div>

      {/* Control Buttons Toolbar */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 xs:gap-2.5 pb-4 sm:pb-5 border-b-[2.5px] sm:border-b-[3px] border-dashed border-[var(--border-color)]">
        {/* Tombol EMAIL BARU */}
        <button
          onClick={onRandomize}
          className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-3 xs:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
          title="Buat alamat acak baru"
        >
          <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black group-hover:rotate-180 transition-transform duration-300 flex-shrink-0" />
          <span className="truncate">EMAIL BARU</span>
        </button>

        {/* Tombol KUSTOM */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="brutal-btn bg-[var(--color-orange)] text-white hover:bg-orange-600 px-3 xs:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs font-bold font-mono-custom flex items-center justify-center gap-1.5 sm:gap-2 uppercase group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
          title="Tentukan nama email kustom"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-rotate-45 transition-transform duration-200 flex-shrink-0" />
          <span className="truncate">KUSTOM</span>
        </button>

        {/* Animated Custom Domain Dropdown */}
        {availableDomains.length > 1 && (
          <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-[10px] sm:text-[11px] font-mono-custom font-bold text-[var(--text-muted)] uppercase hidden md:inline">
              Domain:
            </span>
            <DomainDropdown
              domains={availableDomains}
              selectedDomain={currentDomain}
              onSelect={onChangeDomain}
              className="w-full sm:w-auto flex-1"
            />
          </div>
        )}

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="col-span-2 sm:col-span-1 brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 px-3 xs:px-4 py-2 sm:py-2.5 text-[11px] xs:text-xs flex items-center justify-center gap-1.5 sm:gap-2 sm:ml-auto w-full sm:w-auto group shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]"
          title="Refresh Inbox Manual"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 flex-shrink-0 ${
              isRefreshing ? 'animate-spin-fast' : 'group-hover:rotate-180'
            }`}
          />
          <span className="font-mono-custom font-bold text-[11px] xs:text-xs truncate">
            REFRESH
          </span>
        </button>
      </div>

      {/* Status Footer: Animated INBOX READY Radar Beacon & Live Timer Sync */}
      <div className="flex flex-col xs:flex-row items-center justify-between gap-2.5 sm:gap-3 pt-3.5 sm:pt-4 select-none">
        <div className="flex items-center gap-2">
          {/* Animated Neo-Brutalist INBOX READY Badge */}
          <div className="brutal-badge px-2.5 xs:px-3 py-1 sm:py-1.5 text-[10px] xs:text-xs flex items-center gap-1.5 xs:gap-2 bg-[#ecfdf5] dark:bg-emerald-950 text-[#065f46] dark:text-[#6ee7b7] border-[2px] border-[var(--border-color)] motion-live-badge">
            {/* Pulsing Sonar Rings */}
            <div className="relative flex items-center justify-center w-3 h-3 flex-shrink-0">
              <span className="motion-radar-ring" />
              <span className="motion-radar-ring-delayed" />
              <span className="relative w-2 h-2 rounded-full bg-[var(--color-green)]" />
            </div>

            {/* Signal Equalizer Animation */}
            <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
              <span className="w-1 bg-[var(--color-green)] rounded-full signal-bar-1" />
              <span className="w-1 bg-[var(--color-green)] rounded-full signal-bar-2" />
              <span className="w-1 bg-[var(--color-green)] rounded-full signal-bar-3" />
            </div>

            <span className="font-mono-custom font-black tracking-wide">INBOX READY</span>
          </div>

          <span className="text-[10px] font-mono-custom font-bold text-[var(--color-green)] uppercase hidden sm:inline-flex items-center gap-1">
            <span>&bull;</span> Siap Menerima Email
          </span>
        </div>

        {/* Realtime Auto-sync Countdown */}
        <div className="flex items-center gap-1.5 xs:gap-2 text-[10px] xs:text-xs font-mono-custom font-bold text-[var(--text-muted)] uppercase">
          <Clock className="w-3.5 h-3.5 text-[var(--color-blue)] icon-wiggle flex-shrink-0" />
          <span>Auto-sync:</span>
          <span className="bg-[var(--color-yellow)] text-black border-2 border-[var(--border-color)] px-1.5 xs:px-2 py-0.5 font-black shadow-[1.5px_1.5px_0px_var(--shadow-color)] sm:shadow-[2px_2px_0px_var(--shadow-color)] inline-block min-w-[28px] text-center">
            {countdownSeconds}s
          </span>
        </div>
      </div>

      {/* Modal Custom Email */}
      <CustomEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={onApplyCustom}
        availableDomains={availableDomains}
        currentPrefix={currentPrefix}
        currentDomain={currentDomain}
      />
    </div>
  );
}
