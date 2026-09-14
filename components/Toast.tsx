'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  if (!message) return null;

  const typeConfig = {
    success: {
      border: 'border-black dark:border-white',
      shadow: 'shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#0055ff]',
      badgeBg: 'bg-white text-[#00c853]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#00c853] flex-shrink-0" />,
    },
    error: {
      border: 'border-black dark:border-white',
      shadow: 'shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#0055ff]',
      badgeBg: 'bg-white text-[#ff003c]',
      icon: <AlertCircle className="w-4 h-4 text-[#ff003c] flex-shrink-0" />,
    },
    info: {
      border: 'border-black dark:border-white',
      shadow: 'shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#ffe600]',
      badgeBg: 'bg-[#ffe600] text-black',
      icon: <Sparkles className="w-4 h-4 text-black flex-shrink-0" />,
    },
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <div className="fixed top-3 xs:top-4 sm:top-5 left-1/2 -translate-x-1/2 z-[9999] motion-toast-in pointer-events-auto w-[calc(100vw-1.5rem)] max-w-md">
      <div
        style={{
          backgroundColor:
            type === 'success' ? '#00c853' : type === 'error' ? '#ff003c' : '#0055ff',
          color: '#ffffff',
        }}
        className={`px-3 xs:px-4 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3 text-[11px] xs:text-xs sm:text-sm font-black font-mono-custom uppercase border-[2.5px] sm:border-[3.5px] ${config.border} ${config.shadow}`}
      >
        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${config.badgeBg}`}>
          {config.icon}
        </div>
        <span className="flex-1 tracking-wide leading-tight text-white font-black drop-shadow-sm break-words">
          {message}
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-white hover:bg-black/20 rounded transition-colors flex-shrink-0"
            title="Tutup Notifikasi"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
