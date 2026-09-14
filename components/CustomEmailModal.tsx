'use client';

import React, { useState } from 'react';
import { X, Check, Edit3, Sparkles } from 'lucide-react';
import DomainDropdown, { DomainOption } from './DomainDropdown';

interface CustomEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (prefix: string, domain: string) => void;
  availableDomains: (string | DomainOption)[];
  currentPrefix: string;
  currentDomain: string;
}

export default function CustomEmailModal({
  isOpen,
  onClose,
  onApply,
  availableDomains,
  currentPrefix,
  currentDomain,
}: CustomEmailModalProps) {
  const [prefix, setPrefix] = useState(currentPrefix);

  const initialDomainName =
    currentDomain ||
    (typeof availableDomains[0] === 'string'
      ? availableDomains[0]
      : (availableDomains[0] as DomainOption)?.domain) ||
    '';

  const [selectedDomain, setSelectedDomain] = useState(initialDomainName);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrefix = prefix
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '');

    if (!cleanPrefix) return;
    onApply(cleanPrefix, selectedDomain);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="brutal-card w-full max-w-md p-4 xs:p-5 sm:p-6 bg-white dark:bg-zinc-900 relative shadow-[5px_5px_0px_var(--shadow-color)] sm:shadow-[7px_7px_0px_var(--shadow-color)]">
        {/* Header Bar with Title & Close Button */}
        <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b-2 border-dashed border-[var(--border-color)]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 xs:w-8 xs:h-8 bg-[var(--color-orange)] border-2 border-[var(--border-color)] flex items-center justify-center text-white shadow-[1.5px_1.5px_0px_var(--shadow-color)] flex-shrink-0">
              <Edit3 className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            </div>
            <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--color-purple)] dark:text-[var(--color-pink)] truncate">
              Kustom Alamat Email
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="brutal-btn bg-[var(--color-red)] text-white w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center text-xs hover:bg-red-600 shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0 cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
          </button>
        </div>

        <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)] mb-4 sm:mb-5 leading-relaxed">
          Tentukan nama prefix sesukamu (misal: verifikasi, bisnis, test123).
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--color-blue)] dark:text-[var(--color-cyan)]">
              Prefix / Nama Email:
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="nama.kamu"
              className="brutal-input w-full px-3 py-2.5 sm:px-3.5 sm:py-3 text-xs sm:text-sm font-mono-custom font-bold bg-[#faf5ff] dark:bg-zinc-800"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1 text-[var(--color-purple)] dark:text-[var(--color-pink)]">
              Pilih Domain:
            </label>
            <DomainDropdown
              domains={availableDomains}
              selectedDomain={selectedDomain}
              onSelect={setSelectedDomain}
              className="w-full"
            />
          </div>

          <div className="p-2.5 sm:p-3 bg-[var(--color-yellow)] text-black border-2 sm:border-3 border-[var(--border-color)] text-[11px] xs:text-xs font-mono-custom font-black break-all shadow-[2px_2px_0px_var(--shadow-color)] sm:shadow-[3px_3px_0px_var(--shadow-color)]">
            Hasil: <span className="text-[var(--color-blue)] underline">{prefix || '...'}@{selectedDomain}</span>
          </div>

          <div className="flex gap-2 pt-1.5 sm:pt-2">
            <button
              type="button"
              onClick={onClose}
              className="brutal-btn bg-white dark:bg-zinc-800 text-black dark:text-white flex-1 py-2 sm:py-2.5 text-xs font-bold uppercase shadow-[2px_2px_0px_var(--shadow-color)]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="brutal-btn bg-[var(--color-green)] text-white hover:bg-emerald-600 flex-1 py-2 sm:py-2.5 text-xs font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)]"
            >
              <Check className="w-4 h-4" />
              <span>Gunakan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
