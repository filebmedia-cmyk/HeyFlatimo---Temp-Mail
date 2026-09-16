'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, ArrowRight, ShieldAlert, Sparkles, Eye, EyeOff } from 'lucide-react';
import { playSound } from '@/lib/sound';

interface AccessGateModalProps {
  isOpen: boolean;
  message?: string;
  onUnlockSuccess: () => void;
}

export default function AccessGateModal({
  isOpen,
  message = 'Silakan masukkan kode akses untuk membuka dan menggunakan layanan email sementara ini.',
  onUnlockSuccess,
}: AccessGateModalProps) {
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    if (!cleanKey) {
      playSound('error');
      setErrorMsg('Masukkan kode akses terlebih dahulu');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: cleanKey }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tmail_access_token');
          sessionStorage.removeItem('tmail_access_token');
        }
        playSound('success');
        onUnlockSuccess();
      } else {
        playSound('error');
        setErrorMsg(data.error || 'Kode akses tidak sesuai. Silakan coba lagi.');
      }
    } catch (err: any) {
      playSound('error');
      setErrorMsg('Gagal memverifikasi kode akses ke server.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="brutal-card w-full max-w-md p-5 xs:p-6 sm:p-7 bg-white dark:bg-zinc-900 relative shadow-[6px_6px_0px_var(--shadow-color)] sm:shadow-[8px_8px_0px_var(--shadow-color)] border-[3px] sm:border-[4px] border-[var(--border-color)] motion-modal-in">
        {/* Header Badge */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[var(--color-yellow)] text-black border-[3px] border-[var(--border-color)] flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)] motion-float">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 brutal-badge bg-[var(--color-red)] text-white px-2.5 py-0.5 text-[9px] xs:text-[10px] font-mono-custom mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>AKSES DIKUNCI / ACCESS GATE</span>
          </div>

          <h2 className="font-heading font-black text-xl xs:text-2xl sm:text-3xl uppercase tracking-tight text-[var(--text-main)]">
            KODE AKSES TMAIL
          </h2>

          <p className="text-[11px] xs:text-xs font-mono-custom text-[var(--text-muted)] mt-1.5 leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-[11px] xs:text-xs font-black uppercase font-mono-custom mb-1.5 text-[var(--color-blue)] dark:text-[var(--color-cyan)]">
              Masukkan Kode Kunci (Key):
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Ketik kode akses..."
                className="brutal-input w-full pl-9 sm:pl-10 pr-10 py-2.5 sm:py-3 text-xs xs:text-sm sm:text-base font-mono-custom font-black tracking-wider bg-[#f8fafc] dark:bg-zinc-800"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-black dark:hover:text-white"
                tabIndex={-1}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <div className="mt-2 p-2 bg-[#fef2f2] dark:bg-red-950 border border-[var(--color-red)] text-[var(--color-red)] text-[11px] font-mono-custom font-bold">
                {errorMsg}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying || !inputKey.trim()}
            className="brutal-btn bg-[var(--color-blue)] text-white hover:bg-sky-600 w-full py-2.5 sm:py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_var(--shadow-color)] sm:shadow-[4px_4px_0px_var(--shadow-color)]"
          >
            <span>{isVerifying ? 'MEMVERIFIKASI...' : 'BUKA AKSES WEB'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
