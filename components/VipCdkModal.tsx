'use client';

import React, { useState } from 'react';
import { Crown, KeyRound, X, Check, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface VipCdkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (unlockedDomain?: string) => void;
  targetDomain?: string | null;
}

export default function VipCdkModal({
  isOpen,
  onClose,
  onSuccess,
  targetDomain,
}: VipCdkModalProps) {
  const [cdkInput, setCdkInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCdk = cdkInput.trim();
    if (!cleanCdk) {
      setErrorMessage('Silakan masukkan kode CDK.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/access/verify-vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cdk: cleanCdk }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Kode CDK salah.');
        setIsLoading(false);
        return;
      }

      // Simpan status aktif di sessionStorage (akan reset otomatis saat refresh / tutup web)
      sessionStorage.setItem('tmail_vip_session', 'true');
      setCdkInput('');
      setIsLoading(false);
      onSuccess(targetDomain || undefined);
      onClose();
    } catch (err: any) {
      setErrorMessage('Gagal menghubungi server verifikasi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="brutal-card w-full max-w-md p-5 xs:p-6 sm:p-7 bg-white dark:bg-zinc-900 relative shadow-[6px_6px_0px_var(--shadow-color)] sm:shadow-[8px_8px_0px_var(--shadow-color)] border-[3px] sm:border-[4px] border-[var(--border-color)] motion-modal-in">
        {/* Top Header Bar */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b-[2.5px] border-dashed border-[var(--border-color)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 bg-[var(--color-yellow)] border-2 border-[var(--border-color)] flex items-center justify-center text-black shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
              <Crown className="w-5 h-5 fill-black text-black" />
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 bg-[var(--color-yellow)] text-black text-[9px] font-mono-custom font-black px-1.5 py-0.2 border border-[var(--border-color)] uppercase mb-0.5 shadow-[1px_1px_0px_var(--shadow-color)]">
                <Sparkles className="w-2.5 h-2.5 fill-black" />
                VIP EXCLUSIVE
              </span>
              <h3 className="font-heading font-black text-base xs:text-lg sm:text-xl uppercase tracking-tight text-[var(--text-main)] truncate">
                AKTIVASI DOMAIN VIP
              </h3>
            </div>
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

        {/* Content Info */}
        <p className="text-xs font-mono-custom text-[var(--text-muted)] mb-4 leading-relaxed">
          {targetDomain ? (
            <>
              Domain <strong className="text-black dark:text-yellow-400 bg-amber-100 dark:bg-amber-950/60 px-1 py-0.5 border border-amber-400">@{targetDomain}</strong> berstatus VIP. Masukkan kode CDK untuk membuka semua domain bermahkota pada sesi ini.
            </>
          ) : (
            'Masukkan kode CDK / Passcode untuk mengaktifkan seluruh domain VIP bermahkota 👑 pada sesi browser ini.'
          )}
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-2.5 sm:p-3 mb-4 bg-red-100 dark:bg-red-950/50 border-2 border-[var(--color-red)] text-[var(--color-red)] text-xs font-mono-custom flex items-center gap-2 shadow-[2px_2px_0px_var(--shadow-color)] animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-bold leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] xs:text-xs font-mono-custom font-bold text-[var(--text-main)] mb-1.5 uppercase">
              Kode CDK / VIP Passcode:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <KeyRound className="w-4 h-4 text-[var(--color-yellow)] fill-amber-400" />
              </div>
              <input
                type="password"
                value={cdkInput}
                onChange={(e) => setCdkInput(e.target.value)}
                placeholder="Masukkan kode CDK..."
                autoFocus
                disabled={isLoading}
                className="brutal-input w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-mono-custom font-bold bg-white dark:bg-zinc-950 border-[2.5px] border-[var(--border-color)]"
              />
            </div>
            <p className="text-[10px] font-mono-custom text-[var(--text-muted)] mt-1.5">
              *Akses aktif selama browser terbuka dan otomatis terkunci kembali jika di-refresh.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="brutal-btn bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3.5 sm:px-4 py-2 text-xs font-bold font-mono-custom"
            >
              BATAL
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 px-4 sm:px-5 py-2 text-xs font-black font-mono-custom flex items-center gap-1.5 shadow-[2.5px_2.5px_0px_var(--shadow-color)] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>MEMVERIFIKASI...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>AKTIFKAN VIP</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
