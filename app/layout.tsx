import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI ARENA: Code Wars",
  description: "Claude가 AI 경쟁자들을 격파하는 보스 러시 액션 게임",
  keywords: ["Claude", "AI", "게임", "보스 러시", "사이버펑크"],
  openGraph: {
    title: "AI ARENA: Code Wars",
    description: "Claude가 AI 경쟁자들을 격파하는 보스 러시 액션 게임",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-cyber-dark min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
