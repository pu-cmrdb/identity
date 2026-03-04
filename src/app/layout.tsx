import { Google_Sans_Flex, Noto_Sans_TC } from 'next/font/google';

import { TRPCReactProvider } from '@/trpc/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import type { Metadata } from 'next';

import '@/styles/globals.css';

const notoSansTC = Noto_Sans_TC({
  display: 'swap',
  preload: false,
  variable: '--font-noto-sans-tc',
});

const googleSansFlex = Google_Sans_Flex({
  display: 'swap',
  fallback: ['Noto Sans TC', 'sans-serif'],
  subsets: ['latin'],
  variable: '--font-google-sans-flex',
});

export const metadata: Metadata = {
  description: 'Identity Management System 行雲者身分管理系統',
  title: '行雲身分管理系統',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      className={`
        ${notoSansTC.variable}
        ${googleSansFlex.variable}
      `}
      lang="zh-Hant"
    >
      <body>
        <TooltipProvider>
          <TRPCReactProvider>
            {children}
          </TRPCReactProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
