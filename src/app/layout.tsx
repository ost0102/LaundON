import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { AppHydrator } from '@/components/providers/AppHydrator';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastContainer } from '@/components/ui/ToastContainer';

import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'LaundON',
  description: '우리동네 코인세탁소의 세탁기/건조기 상태를 실시간으로 확인하세요.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 antialiased dark:bg-slate-950`}
      >
        <QueryProvider>
          <AppHydrator />
          <div className="mx-auto min-h-screen w-full max-w-md bg-white shadow-sm dark:bg-slate-950">
            {children}
          </div>
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
