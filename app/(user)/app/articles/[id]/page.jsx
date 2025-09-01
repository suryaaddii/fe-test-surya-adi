import Link from "next/link";
import { api } from "@/lib/axios";
import SafeImg from "@/components/SafeImg";

const ARTICLE_BASE = "/app/articles";

/* Helpers */
function toAbsolute(u) {
  if (!u || typeof u !== "string") return "";
  if (/^https?:\/\//i.test(u) || /^data:image\//i.test(u)) return u;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const origin = base.replace(/\/api\/?$/, "").replace(/\/$/, "");
  return `${origin}${u.startsWith("/") ? "" : "/"}${u}`;
}
const stripHtml = (s = "") => s.replace(/<[^>]+>/g, "");
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
const fmtDate = (d) =>
  d
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).format(new Date(d))
    : "";

/* Data fetchers */
async function getDetail(id) {
  const { data } = await api.get(`/articles/${id}`);
  return data;
}
async function getOthers(categoryId, excludeId) {
  const { data } = await api.get("/articles", {
    params: { category: categoryId, limit: 3, exclude: excludeId },
  });
  return data?.data || data?.items || [];
}

export default async function Page({ params }) {
  const { id } = params; // id dari folder [id]

  let article = null;
  try {
    article = await getDetail(id); // langsung pakai string id
  } catch (e) {
    console.error("Error fetch article:", e);
  }

  if (!article) {
    return (
      <main className="mx-auto max-w-[980px] px-4 py-10 pt-24">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">Article not found</h1>
          <p className="mt-2 text-slate-600">
            We can’t find the article you’re looking for.
          </p>
          <div className="mt-6">
            <Link
              href={ARTICLE_BASE}
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
  const createdAt = fmtDate(article?.createdAt);
  const author = article?.author?.name || article?.createdBy || "Admin";
  const categoryId =
    article?.category?.id ?? article?.category_id ?? article?.categoryId;

  let others = [];
  if (categoryId) {
    try {
      others = await getOthers(categoryId, article.id);
    } catch {}
  }

  const heroSrc = getThumb(article) || pic(`detail-${article.id}`, 1200, 700);
  const heroFallback = pic(`fb-detail-${article.id}`, 1200, 700);

  return (
    <main className="mx-auto max-w-[980px] px-4 py-8">
      <div className="overflow-hidden">
        <div className="px-7 py-8 space-y-6">
          <div className="text-center text-[12px] text-slate-500">
            {createdAt && <span>{createdAt}</span>}
            <span className="mx-1.5">•</span>
            <span>Created by {author}</span>
          </div>

          <h1 className="text-center text-[20px] sm:text-[22px] font-semibold leading-snug">
            {title}
          </h1>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <SafeImg
              src={heroSrc}
              fallback={heroFallback}
              alt={title}
              className="w-full h-auto object-cover"
            />
          </div>

          <article
            className="prose prose-slate max-w-none prose-p:my-3 prose-li:my-1.5 prose-ul:my-4 prose-headings:mt-6 prose-headings:mb-3"
            dangerouslySetInnerHTML={{ __html: article?.content || "" }}
          />
        </div>

        {others.length > 0 && (
          <div className="px-7 pb-8">
            <h2 className="text-[15px] font-semibold mb-4">Other articles</h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => {
                const osrc = getThumb(o) || pic(`other-${o.id}`, 720, 480);
                const ofb = pic(`fb-other-${o.id}`, 720, 480);
                const dateTxt = fmtDate(o.createdAt);
                const rawExcerpt =
                  o.excerpt || o.summary || stripHtml(o.content || "");
                const excerpt = rawExcerpt.slice(0, 160);

                return (
                  <li key={o.id}>
                    <Link
                      href={`${ARTICLE_BASE}/${o.id}`}
                      className="group block"
                    >
                      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                        <div className="aspect-[16/9] bg-slate-100">
                          <SafeImg
                            src={osrc}
                            fallback={ofb}
                            alt={o.title || "thumbnail"}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
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
