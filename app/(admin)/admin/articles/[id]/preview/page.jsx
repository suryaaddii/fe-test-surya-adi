import Link from "next/link";
import { api } from "@/lib/axios";
import SafeImg from "@/components/SafeImg";

const ARTICLE_BASE = "/admin/articles";

/* ========== Helpers ========== */
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
function fmtDate(d) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }).format(new Date(d));
  } catch {
    return "";
  }
}
const pic = (seed, w, h) =>
  `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/${w}/${h}`;

// ✅ tambahkan ini
function stripHtml(html = "") {
  if (typeof html !== "string") return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ========== Data fetchers ========== */
async function getDetail(idOrSlug) {
  const { data } = await api.get(`/articles/${idOrSlug}`);
  return data;
}
async function getOthers(categoryId, excludeIdOrSlug) {
  const { data } = await api.get("/articles", {
    params: {
      category: categoryId,
      category_id: categoryId,
      limit: 3,
      per_page: 3,
      exclude: excludeIdOrSlug,
    },
  });
  return data?.data || data?.items || [];
}

/* ========== Page ========== */
export default async function PreviewArticlePage({ params }) {
  const id = params.id;

  let article = null;
  try {
    article = await getDetail(id);
  } catch {}

  if (!article) {
    return (
      <main className="mx-auto max-w-[980px] px-4 py-10">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">Article not found</h1>
          <p className="mt-2 text-slate-600">
            We can’t find the article you’re looking for.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/articles"
              className="inline-flex rounded-md border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50"
            >
              Back to list
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const title = article?.title || article?.name || "Untitled";
  const createdAt = article?.createdAt;
  const categoryName =
    article?.category?.name || article?.category_name || "Uncategorized";

  const heroSrc = getThumb(article) || pic(`${article.id}-hero`, 1200, 640);

  const categoryId =
    article?.category?.id ?? article?.category_id ?? article?.categoryId;
  const others = categoryId
    ? await getOthers(categoryId, article.slug ?? id)
    : [];

  return (
    <main className="mx-auto max-w-[980px] px-4 py-8">
      <div className="overflow-hidden">
        <div className="px-5 py-8">
          <div className="text-center text-xs text-slate-500">
            <span>{createdAt ? fmtDate(createdAt) : "—"}</span>
            <span className="mx-1.5">•</span>
            <span>Created by Admin</span>
            <span className="mx-1.5">•</span>
            <span>{categoryName}</span>
          </div>

          <h1 className="mt-2 text-center text-2xl sm:text-3xl font-bold leading-tight">
            {title}
          </h1>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <img
              src={heroSrc}
              alt={title}
              className="w-full h-auto object-cover"
            />
          </div>

          <article
            className="prose prose-slate max-w-none mt-6"
            dangerouslySetInnerHTML={{ __html: article?.content || "" }}
          />
        </div>

        {others.length > 0 && (
          <div className="px-7 pb-8">
            <h2 className="text-[15px] font-semibold mb-4">Other articles</h2>

            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.slice(0, 3).map((o) => {
                const osrc = getThumb(o) || pic(`other-${o.id}`, 720, 480);
                const ofb = pic(`fb-other-${o.id}`, 720, 480);
                const dateTxt = fmtDate(o.createdAt);
                const rawExcerpt =
                  o.excerpt || o.summary || stripHtml(o.content || "");
                const excerpt = rawExcerpt.slice(0, 160);

                return (
                  <li key={o.id}>
                    <Link
                      href={`${ARTICLE_BASE}/${o.slug || o.id}`}
                      className="group block"
                    >
                      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                        {/* Image */}
                        <div className="aspect-[16/9] bg-slate-100">
                          <SafeImg
                            src={osrc}
                            fallback={ofb}
                            alt={o.title || "thumbnail"}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>

                        {/* Texts */}
                        <div className="p-5">
                          {dateTxt && (
                            <p className="text-sm text-slate-500 mb-1">
                              {dateTxt}
                            </p>
                          )}

                          <h3 className="text-xl sm:text-[22px] font-semibold text-slate-900 leading-snug group-hover:underline">
                            {o.title}
                          </h3>

                          {excerpt && (
                            <p className="mt-2 text-slate-600 text-sm sm:text-base leading-6 line-clamp-3">
                              {excerpt}
                              {rawExcerpt.length > 160 ? "…" : ""}
                            </p>
                          )}

                          {/* Pills */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {[
                              o?.category?.name || "Technology",
                              ...(o?.tags?.length ? [o.tags[0]] : ["Design"]),
                            ].map((t, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
