import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WORDLEARN - ระบบเรียนรู้คำศัพท์",
  description: "เว็บแอปพลิเคชันสำหรับจัดการและทบทวนคำศัพท์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
