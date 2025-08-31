"use client";

export default function Pagination({ page, lastPage, onPage }) {
  if (!lastPage || lastPage < 2) return null;

  const clamp = (p) => Math.min(Math.max(1, p), lastPage);
  const goto = (p) => () => onPage(clamp(p));

  const pages = [];
  pages.push(1);
  if (page - 1 > 2) pages.push("…");
  if (page - 1 > 1) pages.push(page - 1);
  if (page !== 1 && page !== lastPage) pages.push(page);
  if (page + 1 < lastPage) pages.push(page + 1);
  if (lastPage - (page + 1) > 1) pages.push("…");
  if (lastPage !== 1) pages.push(lastPage);

  return (
    <nav className="flex items-center justify-center gap-8 font-archivo text-[14px] leading-[22px] text-slate-800">
      <button
        onClick={goto(page - 1)}
        disabled={page === 1}
        className="inline-flex items-center gap-2 px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:text-slate-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span>Previous</span>
      </button>

      <div className="flex items-center gap-3">
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e-${i}`} className="text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={goto(p)}
              className={`h-9 min-w-9 px-3 rounded-lg transition
                ${
                  p === page
                    ? "border border-[#D6E3FF] bg-white font-medium"
                    : "hover:bg-slate-50"
                }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={goto(page + 1)}
        disabled={page === lastPage}
        className="inline-flex items-center gap-2 px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:text-slate-900"
      >
        <span>Next</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}
