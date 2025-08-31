"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import Pagination from "@/components/Pagination";
import useDebounce from "@/hooks/useDebounce";

const LIMIT = 10;

// Fungsi untuk gambar berdasarkan kategori
const generateCategoryBasedImage = (
  articleId,
  categoryName,
  width = 80,
  height = 60
) => {
  const categoryThemes = {
    technology: "technology",
    food: "food",
    travel: "travel",
    business: "business",
    health: "health",
    education: "education",
    sports: "sports",
    entertainment: "entertainment",
    lifestyle: "lifestyle",
    science: "science",
    politics: "politics",
    finance: "finance",
    default: "abstract",
  };

  // Normalisasi nama kategori
  const normalizedCategory =
    categoryName?.toLowerCase().replace(/\s+/g, "") || "default";

  const theme =
    categoryThemes[normalizedCategory] ||
    categoryThemes[
      Object.keys(categoryThemes).find(
        (key) =>
          normalizedCategory.includes(key) || key.includes(normalizedCategory)
      )
    ] ||
    categoryThemes.default;

  const seed = Math.abs(articleId + (categoryName?.length || 0));

  return `https://picsum.photos/seed/${theme}-${seed}/${width}/${height}`;
};

// Komponen gambar yang dioptimasi
const ArticleImage = ({ articleId, title, category }) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  // Memoize URL gambar berdasarkan kategori
  const imageUrl = useMemo(() => {
    return generateCategoryBasedImage(articleId, category?.name, 80, 60);
  }, [articleId, category?.name]);

  const fallbackUrls = useMemo(() => {
    const categoryName = category?.name || "default";
    const seed = Math.abs(articleId + (categoryName?.length || 0));

    return [
      `https://picsum.photos/seed/fallback-${seed}/80/60`,
      `https://picsum.photos/id/${(seed % 100) + 1}/80/60`,
      `data:image/svg+xml;base64,${btoa(`
        <svg width="80" height="60" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="60" fill="#e2e8f0"/>
          <text x="40" y="35" font-family="Arial" font-size="12" fill="#64748b" text-anchor="middle">
            ${categoryName.charAt(0).toUpperCase()}
          </text>
        </svg>
      `)}`,
    ];
  }, [articleId, category?.name]);

  const handleImageError = useCallback(() => {
    console.log(
      `Image error for article ${articleId}, trying fallback ${
        fallbackIndex + 1
      }`
    );
    if (fallbackIndex < fallbackUrls.length - 1) {
      setFallbackIndex((prev) => prev + 1);
    } else {
      setImageError(true);
    }
  }, [fallbackIndex, fallbackUrls.length, articleId]);

  useEffect(() => {
    setImageError(false);
    setFallbackIndex(0);
  }, [articleId, category?.name]);

  const currentImageUrl = imageError
    ? fallbackUrls[fallbackUrls.length - 1]
    : fallbackIndex > 0
    ? fallbackUrls[fallbackIndex]
    : imageUrl;

  return (
    <div className="flex justify-center">
      <img
        src={currentImageUrl}
        alt={`${category?.name || "Article"} thumbnail for ${title}`}
        className="w-[60px] h-[45px] object-cover rounded-md border border-slate-200"
        loading="lazy"
        onError={handleImageError}
        style={{
          display: "block",
          width: "60px",
          height: "45px",
        }}
        title={`Category: ${category?.name || "Uncategorized"}`}
      />
    </div>
  );
};

const ImageErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [children]);

  if (hasError) {
    return (
      fallback || (
        <div className="w-[60px] h-[45px] bg-gray-200 rounded-md flex items-center justify-center">
          <span className="text-xs text-gray-500">IMG</span>
        </div>
      )
    );
  }

  return children;
};

export default function AdminArticlesPage() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState();
  const [loading, setLoading] = useState(true);

  // --- Modal Delete state ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    []
  );

  async function fetchData(p = 1, s = "", cat) {
    setLoading(true);
    try {
      const { data } = await api.get("/articles", {
        params: {
          page: p,
          limit: LIMIT,
          title: s || undefined,
          category: cat || undefined,
        },
      });
      const items = Array.isArray(data?.data) ? data.data : [];
      const totalPages =
        data?.totalPages ??
        (data?.totalData ? Math.max(1, Math.ceil(data.totalData / LIMIT)) : 1);

      setRows(items);
      setPage(data?.currentPage ?? p);
      setLastPage(totalPages || 1);
      setTotal(data?.totalData ?? items.length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(1);
  }, []);
  useEffect(() => {
    fetchData(1, debouncedSearch, categoryId);
  }, [debouncedSearch]);
  useEffect(() => {
    fetchData(1, search, categoryId);
  }, [categoryId]);

  // --- Delete flow ---
  function askDelete(id) {
    const art = rows.find((r) => r.id === id);
    setSelected({ id, title: art?.title || "" });
    setConfirmOpen(true);
  }
  async function confirmDelete() {
    if (!selected?.id) return;
    try {
      setDeletingId(selected.id);
      await api.delete(`/articles/${selected.id}`);
      const nextPage = rows.length === 1 && page > 1 ? page - 1 : page;
      await fetchData(nextPage, search, categoryId);
      setConfirmOpen(false);
      setSelected(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1240px]">
      <section className="rounded-[12px] border border-slate-200 bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <p className="font-archivo text-[16px] leading-5 font-medium">
            Total Articles :{" "}
            <span className="font-medium text-slate-700">{total}</span>
          </p>
        </div>

        <div className="px-5 py-4 border-b border-slate-200 font-archivo">
          <div className="grid grid-cols-[110px_1fr_auto] items-center gap-3 w-full">
            <button
              type="button"
              className="w-[109px] h-9 px-3 inline-flex items-center justify-between gap-[6px]
                         rounded-md border border-slate-200 text-sm text-slate-700 bg-white"
            >
              <span>Category</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <div className="relative max-w-[240px] w-full">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title"
                className="pl-9 pr-3 h-9 w-full rounded-md border border-slate-200
                           text-sm text-slate-700 placeholder:text-slate-400 font-archivo"
              />
            </div>

            <Link
              href="/admin/articles/new"
              className="inline-flex items-center rounded-md bg-[#2563EB] px-4 py-2 
                         font-archivo text-sm font-medium text-white hover:opacity-95"
            >
              + Add Articles
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto font-archivo text-[14px] leading-[20px]">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[10%]" />
              <col className="w-[30%]" />
              <col className="w-[20%]" />
              <col className="w-[30%]" />
              <col className="w-[20%]" />
            </colgroup>

            <thead className="bg-gray-100">
              <tr className="text-slate-900">
                <th className="px-6 py-3 font-medium text-center">Image</th>
                <th className="px-6 py-3 font-medium text-center">Title</th>
                <th className="px-6 py-3 font-medium text-center">Category</th>
                <th className="px-6 py-3 font-medium text-center">
                  Created at
                </th>
                <th className="px-6 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-6 text-slate-500 text-center"
                  >
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-6 text-slate-500 text-center"
                  >
                    No articles found.
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <tr
                    key={a.id}
                    className="align-middle hover:bg-slate-50/60 h-16"
                  >
                    {/* Image */}
                    <td className="px-6 py-3 text-center">
                      <ArticleImage
                        articleId={a.id}
                        title={a.title}
                        category={a.category}
                      />
                    </td>

                    <td className="px-6 py-3 text-center">
                      <div className="text-slate-800 whitespace-normal break-words line-clamp-2">
                        {a.title}
                      </div>
                    </td>

                    <td className="px-6 py-3 text-center text-slate-600">
                      <span className="inline-block max-w-full truncate">
                        {a.category?.name ?? "-"}
                      </span>
                    </td>

                    <td className="px-6 py-3 text-center text-slate-600">
                      <span className="whitespace-nowrap">
                        {a.createdAt ? fmt.format(new Date(a.createdAt)) : "-"}
                      </span>
                    </td>

                    <td className="px-6 py-3 text-center">
                      <div className="inline-flex items-center justify-end gap-3 text-[14px] leading-5 whitespace-nowrap">
                        <Link
                          href={`/admin/articles/${a.slug || a.id}/preview`}
                          className="text-[#2563EB] hover:opacity-80 underline"
                        >
                          Preview
                        </Link>
                        <Link
                          href={`/admin/articles/${a.id}/edit`}
                          className="text-[#2563EB] hover:opacity-80 underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => askDelete(a.id)}
                          className="text-red-500 hover:text-red-600 cursor-pointer underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3">
          {lastPage > 1 && (
            <div className="flex items-center justify-center">
              <Pagination
                page={page}
                lastPage={lastPage}
                onPage={(p) => fetchData(p, search, categoryId)}
              />
            </div>
          )}
        </div>
      </section>

      {confirmOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => !deletingId && setConfirmOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-article-title"
              aria-describedby="delete-article-desc"
              className="w-[400px] h-[180px] max-w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
            >
              <div className="p-6 h-full flex flex-col">
                <h3
                  id="delete-article-title"
                  className="font-archivo text-[18px] font-semibold text-slate-900"
                >
                  Delete Article
                </h3>
                <p
                  id="delete-article-desc"
                  className="mt-2 text-[14px] text-slate-500"
                >
                  Deleting this article is permanent and cannot undone. All
                  related content will be removed.
                </p>
                <div className="mt-auto flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(false)}
                    disabled={!!deletingId}
                    className="h-10 px-4 text-[14px] rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={!!deletingId}
                    className="h-10 px-5 text-[14px] rounded-lg bg-[#E11D48] text-white hover:bg-[#DC1F3A] disabled:opacity-60 cursor-pointer"
                  >
                    {deletingId ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const imageUrlCache = new Map();

const generateCategoryBasedImageCached = (
  articleId,
  categoryName,
  width = 80,
  height = 60
) => {
  const cacheKey = `${articleId}-${categoryName}-${width}-${height}`;

  if (imageUrlCache.has(cacheKey)) {
    return imageUrlCache.get(cacheKey);
  }

  const url = generateCategoryBasedImage(
    articleId,
    categoryName,
    width,
    height
  );
  imageUrlCache.set(cacheKey, url);

  return url;
};
