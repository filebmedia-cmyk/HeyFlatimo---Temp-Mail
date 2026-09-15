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
  description: 'Fast, secure & private temporary disposable email service powered by Cloudflare and MongoDB.',
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
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased selection:bg-indigo-500 selection:text-white relative min-h-screen">
        <PsBackground />
        <div className="relative z-10 min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}

