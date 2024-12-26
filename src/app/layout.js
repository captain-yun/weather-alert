import "./globals.css";

export const metadata = {
  title: "날씨 알리미",
  description: "매일 카카오톡으로 날씨를 알려드립니다",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="font-sans">
        <main className="max-w-4xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
} 