import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Amrita Feast — Skip the Queue',
  description:
    'Order food from your classroom at Amrita Vishwa Vidyapeetham, Bengaluru. Scan your ID, browse the menu, pay via UPI, and skip the canteen queue.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Amrita Feast',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#FF6B35',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid rgba(255,107,53,0.2)',
              color: '#1A1A2E',
              boxShadow: '0 4px 20px rgba(255,107,53,0.15)',
            },
          }}
        />
      </body>
    </html>
  );
}
