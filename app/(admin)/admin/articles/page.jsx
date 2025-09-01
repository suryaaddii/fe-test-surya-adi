"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import Pagination from "@/components/Pagination";
import useDebounce from "@/hooks/useDebounce";

const LIMIT = 10;

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

const ArticleImage = ({ articleId, title, category }) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

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
    if (fallbackIndex < fallbackUrls.length - 1) {
      setFallbackIndex((prev) => prev + 1);
    } else {
      setImageError(true);
    }
  }, [fallbackIndex, fallbackUrls.length]);

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
      />
    </div>
  );
};

export default function AdminArticlesPage() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState();
  const [loading, setLoading] = useState(true);

  // --- Category State ---
  const [categories, setCategories] = useState([]);
  const [openCat, setOpenCat] = useState(false);

  // --- Modal Delete ---
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

  async function fetchCategories() {
    try {
      const { data } = await api.get("/categories");
      // adaptif: kalau backend balikin {data: []} atau langsung []
      const cats = Array.isArray(data?.data) ? data.data : data;
      setCategories(cats);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }

  useEffect(() => {
    fetchData(1);
    fetchCategories();
  }, []);
  useEffect(() => {
    fetchData(1, debouncedSearch, categoryId);
  }, [debouncedSearch, categoryId]);

  // --- Delete Flow ---
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
          <div className="grid grid-cols-[160px_1fr_auto] items-center gap-3 w-full">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenCat(!openCat)}
                className="w-[150px] h-9 px-3 inline-flex items-center justify-between gap-[6px]
                           rounded-md border border-slate-200 text-sm text-slate-700 bg-white"
              >
                <span>
                  {categoryId
                    ? categories.find((c) => c.id === categoryId)?.name
                    : "Category"}
                </span>
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
              {openCat && (
                <ul className="absolute mt-1 w-[150px] bg-white border border-slate-200 rounded-md shadow-md z-10">
                  <li
                    onClick={() => {
                      setCategoryId(undefined);
                      setOpenCat(false);
                    }}
                    className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    All
                  </li>
                  {categories.map((cat) => (
                    <li
                      key={cat.id}
                      onClick={() => {
                        setCategoryId(cat.id);
                        setOpenCat(false);
                      }}
                      className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      {cat.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Search */}
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

        {/* Table */}
        <div className="overflow-x-auto font-archivo text-[14px] leading-[20px]">
          <table className="w-full table-fixed border-collapse">
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

        {/* Pagination */}
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
    </div>
  );
}
