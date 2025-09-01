"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import Pagination from "@/components/Pagination";
import useDebounce from "@/hooks/useDebounce";

/* =================== Config =================== */
const LIMIT = 9;
const ARTICLE_BASE = "/app/articles";

/* =================== Helpers =================== */
function toAbsolute(u) {
  if (!u || typeof u !== "string") return "";
  if (/^https?:\/\//i.test(u) || /^data:image\//i.test(u)) return u;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const origin = base.replace(/\/api\/?$/, "").replace(/\/$/, "");
  return `${origin}${u.startsWith("/") ? "" : "/"}${u}`;
}
function getThumb(a) {
  const raw =
    a?.thumbnail ??
    a?.imageurl ??
    a?.imageUrl ??
    a?.image ??
    a?.thumbnailUrl ??
    "";
  return toAbsolute(raw);
}
const pic = (seed, w, h) =>
  `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/${w}/${h}`;
const stripHtml = (s = "") => s.replace(/<[^>]+>/g, "");
const fmtDate = (d) =>
  d
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).format(new Date(d))
    : "";

/* =================== Page =================== */
export default function UserArticlesPage() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  /* ---- Fetch categories ---- */
  useEffect(() => {
    api
      .get("/categories", { params: { limit: 100 } })
      .then(({ data }) => {
        const list = data?.data ?? data?.rows ?? data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => setCategories([]));
  }, []);

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      title: debouncedSearch || undefined,
      category: categoryId || undefined,
    }),
    [page, debouncedSearch, categoryId]
  );

  /* ---- Fetch articles ---- */
  useEffect(() => {
    setLoading(true);
    api
      .get("/articles", { params })
      .then(({ data }) => {
        const items =
          data?.data ?? data?.rows ?? (Array.isArray(data) ? data : []);
        const totalData =
          data?.totalData ?? data?.total ?? data?.count ?? items.length;
        const totalPages =
          data?.totalPages ??
          (totalData ? Math.max(1, Math.ceil(totalData / LIMIT)) : 1);

        setRows(Array.isArray(items) ? items : []);
        setTotal(totalData || 0);
        setLastPage(totalPages || 1);
      })
      .catch(() => {
        setRows([]);
        setTotal(0);
        setLastPage(1);
      })
      .finally(() => setLoading(false));
  }, [params]);

  /* ---- Reset ke page 1 saat filter/search berubah ---- */
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId]);

  const showing = total ? Math.min(page * LIMIT, total) : 0;

  return (
    <div className="min-h-svh">
      {/* =================== LIST =================== */}
      <main className="mx-auto max-w-[1240px] px-4 py-6">
        <p className="text-sm text-slate-600 text-center sm:text-left">
          Showing : <b>{showing}</b> of <b>{total}</b> articles
        </p>

        {loading ? (
          <p className="mt-4 text-sm opacity-70 text-center sm:text-left">
            Loading...
          </p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-sm opacity-70 text-center sm:text-left">
            No articles found.
          </p>
        ) : (
          <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {rows.map((a) => {
              const thumb = getThumb(a) || pic(`user-${a.id}`, 640, 400);
              const dateTxt = fmtDate(a.createdAt);
              const catName = a?.category?.name || "Design";

              return (
                <article
                  key={a.id}
                  className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm"
                >
                  <Link href={`${ARTICLE_BASE}/${a.id}`} className="block">
                    <div className="aspect-[16/9] bg-slate-100">
                      <img
                        src={thumb}
                        alt={a.title || "article"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = pic(
                            `fallback-${a.id}`,
                            640,
                            400
                          );
                        }}
                      />
                    </div>
                    <div className="p-4">
                      {dateTxt && (
                        <p className="text-[11px] text-slate-500 mb-1">
                          {dateTxt}
                        </p>
                      )}
                      <h3 className="font-semibold leading-snug line-clamp-2">
                        {a.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                        {stripHtml(a.content).slice(0, 160)}
                        {stripHtml(a.content).length > 160 ? "…" : ""}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="inline-block rounded-full bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5">
                          {catName}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </section>
        )}

        {lastPage > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination page={page} lastPage={lastPage} onPage={setPage} />
          </div>
        )}
      </main>
    </div>
  );
}
