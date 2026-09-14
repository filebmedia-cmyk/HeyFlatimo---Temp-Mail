'use client';

import React from 'react';
import { Megaphone, X, CheckCircle, Sparkles } from 'lucide-react';

interface AnnouncementModalProps {
  isOpen: boolean;
  id?: string;
  tag?: string;
  title: string;
  content: string;
  displayMode: 'always' | 'once_per_session' | 'once_per_device';
  onClose: () => void;
}

export default function AnnouncementModal({
  isOpen,
  id = 'ann_default',
  tag = 'PENGUMUMAN RESMI',
  title,
  content,
  displayMode,
  onClose,
}: AnnouncementModalProps) {
  if (!isOpen) return null;

  const handleDismiss = () => {
    if (displayMode === 'once_per_session') {
      sessionStorage.setItem(`tmail_seen_ann_${id}`, 'true');
    } else if (displayMode === 'once_per_device') {
      localStorage.setItem(`tmail_seen_ann_${id}`, 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="brutal-card w-full max-w-lg p-5 xs:p-6 sm:p-7 bg-white dark:bg-zinc-900 relative shadow-[6px_6px_0px_var(--shadow-color)] sm:shadow-[8px_8px_0px_var(--shadow-color)] border-[3px] sm:border-[4px] border-[var(--border-color)] motion-modal-in">
        {/* Top Header Bar */}
        <div className="flex items-start justify-between gap-3 mb-3.5 sm:mb-4 pb-3 border-b-[2.5px] border-dashed border-[var(--border-color)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--color-yellow)] border-2 border-[var(--border-color)] flex items-center justify-center text-black shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="inline-block bg-[var(--color-orange)] text-white text-[9px] font-mono-custom font-black px-1.5 py-0.2 border border-[var(--border-color)] uppercase mb-0.5">
                {tag || 'PENGUMUMAN'}
              </span>
              <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)] truncate">
                {title || 'Pemberitahuan Sistem'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="brutal-btn bg-[var(--color-red)] text-white w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center text-xs hover:bg-red-600 shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0 cursor-pointer"
            title="Tutup Pengumuman"
          >
            <X className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-4 bg-[#f8fafc] dark:bg-zinc-950 border-[2px] sm:border-[2.5px] border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] mb-4 sm:mb-5 max-h-64 overflow-y-auto">
          <p className="text-xs sm:text-sm font-mono-custom text-[var(--text-main)] leading-relaxed whitespace-pre-wrap">
            {content || 'Tidak ada konten pengumuman.'}
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 w-full py-2.5 sm:py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_var(--shadow-color)]"
        >
          <CheckCircle className="w-4 h-4" />
          <span>SAYA MENGERTI / TUTUP</span>
        </button>
      </div>
    </div>
  );
}
