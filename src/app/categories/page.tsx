'use client';

import { useEffect, useState, useMemo } from 'react';
import { Category, CategoryDetail, ApiResponse } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
  }>({
    name: '',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Detail Modal State
  const [detailCategory, setDetailCategory] = useState<CategoryDetail | null>(
    null,
  );
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Delete Confirm State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch all categories (GET /api/categories)
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/categories');
      const json: ApiResponse<Category[]> = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'เกิดข้อผิดพลาดในการโหลดหมวดหมู่');
      }

      setCategories(json.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
      );
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchCategories();
  // }, []);

  useEffect(() => {
    const loadCategories = async () => {
      await fetchCategories();
    };

    loadCategories();
  }, []);

  // Show temporary success feedback
  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  // View Category Detail (GET /api/categories/:id)
  const handleViewDetail = async (id: string) => {
    try {
      setIsDetailLoading(true);
      setIsDetailOpen(true);
      const res = await fetch(`/api/categories/${id}`);
      const json: ApiResponse<CategoryDetail> = await res.json();

      if (!res.ok) {
        throw new Error(
          json.error || 'ไม่สามารถดึงข้อมูลรายละเอียดหมวดหมู่ได้',
        );
      }

      setDetailCategory(json.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Handle Create / Update Submit (POST / PATCH)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setFormError('กรุณาระบุชื่อหมวดหมู่');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          description: formData.description.trim() || null,
        }),
      });

      const json: ApiResponse<Category> = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }

      setIsFormOpen(false);
      triggerSuccess(
        editingCategory
          ? `แก้ไขหมวดหมู่ "${trimmedName}" สำเร็จ`
          : `สร้างหมวดหมู่ "${trimmedName}" สำเร็จ`,
      );
      await fetchCategories();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete (DELETE /api/categories/:id)
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      });

      const json: ApiResponse<{ id: string }> = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'เกิดข้อผิดพลาดในการลบหมวดหมู่');
      }

      triggerSuccess(`ลบหมวดหมู่ "${deletingCategory.name}" สำเร็จ`);
      setDeletingCategory(null);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถลบหมวดหมู่ได้');
      setDeletingCategory(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)),
    );
  }, [categories, searchQuery]);

  const totalWords = useMemo(() => {
    return categories.reduce((acc, curr) => acc + (curr._count?.words || 0), 0);
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            จัดการหมวดหมู่คำศัพท์
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            สร้างและจัดกลุ่มคำศัพท์ภาษาอังกฤษเพื่อใช้ในการเรียนรู้และเล่นเกม
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-xs hover:shadow-md transition-all gap-2 cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>เพิ่มหมวดหมู่ใหม่</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-xs transition-all">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-emerald-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 text-sm font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-rose-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-900 text-sm font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats and Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              หมวดหมู่ทั้งหมด:
            </span>
            <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full text-sm">
              {categories.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              คำศัพท์รวม:
            </span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full text-sm">
              {totalWords} คำ
            </span>
          </div>
        </div>

        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="ค้นหาหมวดหมู่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3 top-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl border border-gray-200 animate-pulse space-y-4"
            >
              <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded-md w-full"></div>
              <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
              <div className="pt-3 border-t border-gray-100 flex justify-between">
                <div className="h-4 bg-gray-200 rounded-md w-16"></div>
                <div className="h-4 bg-gray-200 rounded-md w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {searchQuery
              ? 'ไม่พบหมวดหมู่ที่ตรงกับการค้นหา'
              : 'ยังไม่มีหมวดหมู่คำศัพท์'}
          </h3>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
            {searchQuery
              ? `ไม่พบผลลัพธ์สำหรับ "${searchQuery}" ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง`
              : 'เริ่มต้นสร้างหมวดหมู่แรกเพื่อเพิ่มคำศัพท์สำหรับฝึกฝนภาษาอังกฤษ'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenCreate}
              className="mt-5 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors"
            >
              สร้างหมวดหมู่แรก
            </button>
          )}
        </div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg text-gray-900 leading-snug">
                    {cat.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                    {cat._count?.words ?? 0} คำ
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2 min-h-10">
                  {cat.description || (
                    <span className="text-gray-400 italic">ไม่มีคำอธิบาย</span>
                  )}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleViewDetail(cat.id)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  ดูคำศัพท์ในหมวด →
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="px-2.5 py-1 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer font-medium"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => setDeletingCategory(cat)}
                    className="px-2.5 py-1 text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer font-medium"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0 text-rose-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  ชื่อหมวดหมู่ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ผลไม้และอาหาร, หมวดการท่องเที่ยว"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  คำอธิบายหมวดหมู่{' '}
                  <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับคำศัพท์ในหมวดนี้..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  <span>
                    {editingCategory ? 'บันทึกการแก้ไข' : 'สร้างหมวดหมู่'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Detail Modal (GET /api/categories/:id) */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {detailCategory?.name || 'รายละเอียดหมวดหมู่'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {detailCategory?.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                </p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {isDetailLoading ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  กำลังโหลดข้อมูลคำศัพท์...
                </div>
              ) : !detailCategory?.words ||
                detailCategory.words.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  หมวดหมู่นี้ยังไม่มีคำศัพท์ในระบบ
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {detailCategory.words.map((w) => (
                    <div
                      key={w.id}
                      className="py-2.5 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-gray-900 text-sm">
                          {w.term}
                        </span>
                        {w.partOfSpeech && (
                          <span className="ml-1.5 text-xs text-gray-500 italic">
                            ({w.partOfSpeech})
                          </span>
                        )}
                        <p className="text-xs text-gray-600 mt-0.5">
                          {w.meaning}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          w.status === 'MASTERED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : w.status === 'LEARNING'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {w.status === 'MASTERED'
                          ? 'จำได้แล้ว'
                          : w.status === 'LEARNING'
                            ? 'กำลังจำ'
                            : 'ยังไม่ได้จำ'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (DELETE /api/categories/:id) */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-gray-900">
                ยืนยันการลบหมวดหมู่ &quot;{deletingCategory.name}&quot;?
              </h3>
              <p className="text-sm text-gray-600">
                การลบหมวดหมู่นี้จะทำให้คำศัพท์ทั้งหมด{' '}
                {deletingCategory._count?.words ?? 0} คำ
                ที่อยู่ในหมวดหมู่นี้ถูกลบออกจากระบบด้วย (Cascade Delete)
                การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                <span>ยืนยันลบหมวดหมู่</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
