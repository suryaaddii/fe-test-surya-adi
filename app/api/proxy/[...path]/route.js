// app/api/proxy/[...path]/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE = "https://test-fe.mysellerpintar.com/api";

// (opsional) rapikan Set-Cookie dari upstream agar bisa diset di domain vercel
function normalizeSetCookie(sc) {
  return sc
    .split(/,(?=[^;]+?=)/)
    .map((c) => c.replace(/;\s*Domain=[^;]+/i, "")) // hapus Domain=...
    .join(", ");
}

async function forward(req, path) {
  const inUrl = new URL(req.url);
  const target = `${API_BASE}/${path.join("/")}${inUrl.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  const outHeaders = new Headers(upstream.headers);
  const sc = upstream.headers.get("set-cookie");
  if (sc) {
    outHeaders.delete("set-cookie");
    outHeaders.append("set-cookie", normalizeSetCookie(sc));
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}

export const GET = (req, { params }) => forward(req, params.path);
export const POST = (req, { params }) => forward(req, params.path);
export const PUT = (req, { params }) => forward(req, params.path);
export const PATCH = (req, { params }) => forward(req, params.path);
export const DELETE = (req, { params }) => forward(req, params.path);
export const OPTIONS = () => new Response(null, { status: 204 });
