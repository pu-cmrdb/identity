import { TRPCReactProvider } from '@/trpc/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import type { Metadata } from 'next';

import '@/styles/globals.css';

export const metadata: Metadata = {
  description: 'Identity Management System 行雲者身分管理系統',
  title: '行雲身分管理系統',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-Hant">
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
