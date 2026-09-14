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
  Crown,
} from 'lucide-react';
import CustomEmailModal from './CustomEmailModal';
import DomainDropdown, { DomainOption } from './DomainDropdown';

interface EmailCardProps {
  currentEmail: string;
  currentPrefix: string;
  currentDomain: string;
  availableDomains: (string | DomainOption)[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onRandomize: () => void;
  onChangeDomain: (domain: string) => void;
  onApplyCustom: (prefix: string, domain: string) => void;
  onCopy: (email: string) => void;
  countdownSeconds: number;
  isVipUnlocked?: boolean;
  onOpenVipModal?: () => void;
  onRequestVipUnlock?: (domain: string) => void;
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
  isVipUnlocked = false,
  onOpenVipModal,
  onRequestVipUnlock,
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
      {/* Top-Right VIP Crown Icon Button (Compact Icon-Only, No Text Overlap) */}
      <div className="absolute top-2.5 right-2.5 xs:top-3 xs:right-3 sm:top-4 sm:right-4 z-10">
        {isVipUnlocked ? (
          <div
            className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 bg-[var(--color-yellow)] text-black border-2 sm:border-[2.5px] border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)]"
            title="Domain VIP Aktif (Mode Eksklusif)"
          >
            <Crown className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5 fill-black text-black animate-pulse" />
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenVipModal}
            className="brutal-btn w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 bg-white dark:bg-zinc-800 hover:bg-[var(--color-yellow)] dark:hover:bg-[var(--color-yellow)] text-amber-500 hover:text-black dark:hover:text-black border-2 sm:border-[2.5px] border-[var(--border-color)] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] group cursor-pointer transition-colors p-0"
            title="Klik untuk memasukkan CDK & mengaktifkan Domain VIP"
          >
            <Crown className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5 fill-amber-400 group-hover:fill-black group-hover:rotate-12 transition-all duration-200" />
          </button>
        )}
      </div>

      {/* Title Header: Clean, Balanced, Protected from Overlap */}
      <div className="text-center mb-5 sm:mb-6 px-8 xs:px-10 sm:px-12">
        <div className="inline-flex items-center gap-1.5 brutal-badge bg-[var(--color-yellow)] text-black px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] xs:text-[10px] sm:text-[11px] mb-2 sm:mb-2.5 font-mono-custom uppercase tracking-wide max-w-full truncate">
          <Sparkles className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-[var(--color-orange)] icon-wiggle flex-shrink-0" />
          <span className="truncate">DISPOSABLE INBOX SYSTEM</span>
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
        {availableDomains.length >= 1 && (
          <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-[10px] sm:text-[11px] font-mono-custom font-bold text-[var(--text-muted)] uppercase hidden md:inline">
              Domain:
            </span>
            <DomainDropdown
              domains={availableDomains}
              selectedDomain={currentDomain}
              onSelect={onChangeDomain}
              isVipUnlocked={isVipUnlocked}
              onRequestVipUnlock={onRequestVipUnlock}
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
          <span className="hidden xs:inline font-mono-custom font-bold">
            {isRefreshing ? 'MENYINKRONKAN...' : 'REFRESH'}
          </span>
          <span className="xs:hidden">SYNC</span>
        </button>
      </div>

      {/* Auto-Sync Live Status Indicator Badge */}
      <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] xs:text-[11px] font-mono-custom text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5 xs:gap-2">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="motion-radar-ring" />
            <span className="relative w-2 h-2 rounded-full bg-[var(--color-green)]" />
          </div>
          <span className="font-bold text-[var(--text-main)]">
            Auto-Sync Aktif (Setiap {countdownSeconds}s)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[var(--color-blue)]" />
          <span>Masa aktif email: <strong className="text-[var(--text-main)]">24 Jam</strong></span>
        </div>
      </div>

      {/* Custom Email Modal Dialog */}
      <CustomEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={onApplyCustom}
        availableDomains={availableDomains}
        currentPrefix={currentPrefix}
        currentDomain={currentDomain}
        isVipUnlocked={isVipUnlocked}
        onRequestVipUnlock={onRequestVipUnlock}
      />
    </div>
  );
}
