import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "WORDLEARN - ระบบเรียนรู้และทบทวนคำศัพท์",
  description: "เว็บแอปพลิเคชันสำหรับจัดการคลังคำศัพท์และฝึกฝนผ่านเกมทายศัพท์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col antialiased">
        <Navbar />
        <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </body>
    </html>
  );
}