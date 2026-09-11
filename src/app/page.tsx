import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  let categoriesCount = 0;
  let wordsCount = 0;

  try {
    categoriesCount = await prisma.category.count();
    wordsCount = await prisma.word.count();
  } catch (error) {
    console.error("Home page stats error:", error);
  }

  return (
    <div className="space-y-8 py-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-10 text-white shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          WORDLEARN
        </h1>
        <p className="mt-2 text-indigo-100 max-w-xl text-base sm:text-lg">
          ระบบเรียนรู้ จัดการคลังคำศัพท์ภาษาอังกฤษ และฝึกฝนความจำด้วยเกมทายศัพท์
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/categories"
            className="px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded-lg shadow-xs hover:bg-indigo-50 transition-colors"
          >
            จัดการหมวดหมู่คำศัพท์ →
          </Link>
          <Link
            href="/words"
            className="px-5 py-2.5 bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-semibold rounded-lg border border-white/20 transition-colors"
          >
            คลังคำศัพท์
          </Link>
          <Link
            href="/game"
            className="px-5 py-2.5 bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-semibold rounded-lg border border-white/20 transition-colors"
          >
            เริ่มเล่นเกมทายคำศัพท์
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            หมวดหมู่คำศัพท์
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {categoriesCount}
            </span>
            <span className="text-xs text-indigo-600 font-semibold">หมวด</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            คำศัพท์ทั้งหมด
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">
              {wordsCount}
            </span>
            <span className="text-xs text-indigo-600 font-semibold">คำ</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            สถานะการเรียนรู้
          </span>
          <div className="mt-2 text-sm text-gray-600">
            <span>ยังไม่เริ่ม / กำลังจำ / จำได้แล้ว</span>
          </div>
        </div>
      </div>
    </div>
  );
}