import "./globals.css";
import { Inter } from 'next/font/google';
import { startNotificationScheduler } from '@/utils/scheduler';

const inter = Inter({ subsets: ['latin'] });

// 서버 사이드에서만 스케줄러 시작
if (typeof window === 'undefined') {
  // startNotificationScheduler();
}

export const metadata = {
  title: "날씨 알리미",
  description: "매일 카카오톡으로 날씨를 알려드립니다",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <main className="max-w-4xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
} 