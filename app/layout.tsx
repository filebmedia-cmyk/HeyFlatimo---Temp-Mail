import './globals.css';
import type { Metadata, Viewport } from 'next';
import PsBackground from '@/components/PsBackground';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0055ff',
};

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || 'HeyFlatimo'} | Personal Temp Mail`,
  description: 'Layanan email sementara (disposable temp mail) cepat, aman, dan privat untuk menerima kode OTP & link verifikasi secara instan.',
  openGraph: {
    title: `${process.env.NEXT_PUBLIC_APP_NAME || 'HeyFlatimo'} | Personal Temp Mail`,
    description: 'Layanan email sementara (disposable temp mail) cepat, aman, dan privat untuk menerima kode OTP & link verifikasi secara instan.',
    siteName: process.env.NEXT_PUBLIC_APP_NAME || 'HeyFlatimo',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `${process.env.NEXT_PUBLIC_APP_NAME || 'HeyFlatimo'} | Personal Temp Mail`,
    description: 'Layanan email sementara (disposable temp mail) cepat, aman, dan privat untuk menerima kode OTP & link verifikasi secara instan.',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className="max-w-full overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased selection:bg-indigo-500 selection:text-white relative min-h-screen max-w-full overflow-x-hidden">
        <PsBackground />
        <div className="relative z-10 min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">{children}</div>
      </body>
    </html>
  );
}

