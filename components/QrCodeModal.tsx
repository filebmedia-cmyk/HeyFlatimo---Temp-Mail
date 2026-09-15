'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, X, Copy, Check, Download, ExternalLink, ShieldCheck } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onCopySuccess?: (msg: string) => void;
}

export default function QrCodeModal({
  isOpen,
  email,
  onClose,
  onCopySuccess,
}: QrCodeModalProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen || !email) return;

    // Generate high-resolution QR code (contains full web URL for direct access or email text)
    const accessUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/${encodeURIComponent(email)}`
        : email;

    QRCode.toDataURL(
      accessUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setDataUrl(url);
        }
      }
    );
  }, [isOpen, email]);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    if (onCopySuccess) onCopySuccess('Alamat email berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `heyflatimo-qr-${email.split('@')[0] || 'email'}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/70 backdrop-blur-xs">
      <div className="brutal-card w-full max-w-sm bg-[var(--card-bg)] p-4 xs:p-5 sm:p-6 border-[3px] sm:border-[4px] border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)] sm:shadow-[8px_8px_0px_var(--shadow-color)] motion-modal-in relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-[2.5px] border-dashed border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-yellow)] border-2 border-[var(--border-color)] flex items-center justify-center text-black shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm xs:text-base uppercase tracking-tight text-[var(--text-main)]">
                QR CODE EMAIL
              </h3>
              <p className="text-[10px] xs:text-[11px] font-mono-custom text-[var(--text-muted)]">
                Scan via kamera HP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="brutal-btn bg-[var(--color-red)] text-white w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center text-xs hover:bg-red-600 shadow-[2px_2px_0px_var(--shadow-color)] flex-shrink-0 cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center">
          <div className="p-3 bg-white border-[3px] border-[var(--border-color)] shadow-[4px_4px_0px_var(--shadow-color)] mb-4">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt={`QR Code ${email}`}
                className="w-48 h-48 xs:w-52 xs:h-52 sm:w-56 sm:h-56 block image-rendering-pixelated"
              />
            ) : (
              <div className="w-48 h-48 xs:w-52 xs:h-52 sm:w-56 sm:h-56 flex items-center justify-center text-xs font-mono font-bold text-zinc-400">
                Membuat QR Code...
              </div>
            )}
          </div>

          {/* Email Address Pill */}
          <div className="w-full bg-[#f8fafc] dark:bg-zinc-900 border-2 border-[var(--border-color)] p-2.5 mb-4 text-center">
            <span className="text-[9px] font-mono-custom font-black text-[var(--text-muted)] uppercase block mb-0.5">
              Alamat Email Aktif:
            </span>
            <span className="font-mono-custom font-black text-xs xs:text-sm text-[var(--color-blue)] break-all select-all">
              {email}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              type="button"
              onClick={handleCopyEmail}
              className={`brutal-btn py-2 text-xs font-mono-custom font-bold flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)] ${
                copied
                  ? 'bg-[var(--color-green)] text-white'
                  : 'bg-[var(--color-blue)] text-white hover:bg-sky-600'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'TERSALIN' : 'SALIN EMAIL'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadQr}
              className="brutal-btn bg-[var(--color-yellow)] text-black hover:bg-yellow-400 py-2 text-xs font-mono-custom font-bold flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_var(--shadow-color)]"
              title="Download gambar QR Code (PNG)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SIMPAN PNG</span>
            </button>
          </div>

          {/* Bottom Hint */}
          <p className="text-[10px] font-mono-custom text-[var(--text-muted)] text-center mt-3 leading-relaxed">
            Scan untuk membuka inbox email ini secara langsung di smartphone Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
