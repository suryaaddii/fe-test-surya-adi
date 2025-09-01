"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import Pagination from "@/components/Pagination";
import useDebounce from "@/hooks/useDebounce";

/* =================== Config =================== */
const LIMIT = 9;
const ARTICLE_BASE = "/app/articles"; // ganti ke "/user/articles" jika struktur rute kamu pakai /user

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
      category: categoryId || undefined, // backend-mu pakai "category"
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
      {/* =================== HERO =================== */}
      <section
        className="
    relative -mt-16
    w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
  "
      >
        {/* Background image */}
        <img
          src="/bg-user.jpg"
          alt="Hero background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlay biru */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/90 to-[#1E40AF]/85" />

        {/* Konten hero */}
        <div
          className="
            relative z-10 mx-auto max-w-[1240px] px-4
            min-h-[640px] sm:min-h-0
            text-white
            flex flex-col justify-center items-center
            sm:block  /* desktop kembali normal */
            pt-32 sm:pt-28
            pb-20 sm:pb-14
          "
        >
          {/* Blog genzet */}
          <p className="text-[14px] sm:text-base font-bold text-center">
            Blog genzet
          </p>

          {/* Heading */}
          <h1 className="mt-2 text-[36px] sm:text-5xl font-medium leading-snug text-center">
            The Journal : Design Resources,
            <br className="hidden sm:block" />
            Interviews, and Industry News
          </h1>

          {/* Subheading */}
          <p className="mt-2 text-[20px] sm:text-2xl text-center leading-normal">
            Your daily dose of design insights!
          </p>

          {/* Controls */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="
              mt-10 sm:mt-6   /* ⬅️ mobile lebih besar jaraknya */
              flex flex-col sm:flex-row 
              gap-3 justify-center items-center
            "
          >
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              aria-label="Select category"
              className="h-10 w-full sm:w-56 rounded-md border-0 bg-white text-slate-700 px-3 shadow-md ring-1 ring-white/30 focus:ring-2 focus:ring-white"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:max-w-md">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles"
                className="h-10 w-full rounded-md border-0 bg-white pr-10 pl-9 text-slate-700 shadow-md ring-1 ring-white/30 placeholder:text-slate-400 focus:ring-2 focus:ring-white"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
          </form>
        </div>

        {/* garis bawah tipis */}
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-white/20" />
      </section>

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
                  <Link
                    href={`${ARTICLE_BASE}/${a.slug || a.id}`}
                    className="block"
                  >
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

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination page={page} lastPage={lastPage} onPage={setPage} />
          </div>
        )}
      </main>
    </div>
  );
}
