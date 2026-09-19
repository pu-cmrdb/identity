import { TRPCReactProvider } from '@/trpc/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Gabarito, Noto_Sans_TC } from 'next/font/google';

import type { Metadata } from 'next';

import '@/styles/globals.css';

const gabarito = Gabarito({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-gabarito',
});

const notoSansTC = Noto_Sans_TC({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-noto-sans-tc',
});

export const metadata: Metadata = {
  description: 'Identity Management System 行雲者身分管理系統',
  title: '行雲身分管理系統',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      className={`${gabarito.variable} ${notoSansTC.variable}`}
      lang="zh-Hant"
    >
      <body>
        <TooltipProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </TooltipProvider>

        <Toaster />
      </body>
    </html>
  );
}
