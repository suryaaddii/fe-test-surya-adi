"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, FileText, Tag } from "lucide-react";
import { logout, me } from "@/lib/auth";

function NavItem({ href, icon: Icon, label }) {
  const pathname = usePathname();
  const active = pathname?.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
        active
          ? "bg-white/10 text-white"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

const SIDEBAR_W = 240; // px

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);

  // logout modal
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // account dropdown
  const [acctOpen, setAcctOpen] = useState(false);
  const acctRef = useRef(null);

  useEffect(() => {
    me()
      .then(setProfile)
      .catch(() => {});
  }, []);

  const pageTitle = useMemo(() => {
    if (!pathname) return "Dashboard";
    if (pathname.startsWith("/admin/articles")) return "Articles";
    if (pathname.startsWith("/admin/categories")) return "Category";
    return "User Profile";
  }, [pathname]);

  // esc / click outside
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (acctOpen) setAcctOpen(false);
        if (logoutOpen && !loggingOut) setLogoutOpen(false);
      }
    };
    const onClick = (e) => {
      if (acctOpen && acctRef.current && !acctRef.current.contains(e.target)) {
        setAcctOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [acctOpen, logoutOpen, loggingOut]);

  async function confirmLogout() {
    try {
      setLoggingOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
      setAcctOpen(false);
    }
  }

  return (
    <div className="min-h-svh bg-[#F3F5F7]">
      <aside
        className="fixed inset-y-0 left-0 bg-blue-600 text-white py-6 flex flex-col"
        style={{ width: SIDEBAR_W }}
      >
        <div className="flex items-center">
          <Image
            src="/logoipsum2.svg"
            alt="Logo"
            width={280}
            height={32}
            className="w-[280px] h-[32px]"
          />
        </div>

        <nav className="space-y-1 mt-6 px-4 font-medium text-[16px] text-white flex-1">
          <NavItem href="/admin/articles" icon={FileText} label="Articles" />
          <NavItem href="/admin/categories" icon={Tag} label="Category" />

          <div className="mt-auto space-y-2 pb-2">
            <button
              onClick={() => setLogoutOpen(true)}
              className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      <div
        className="min-h-svh flex flex-col"
        style={{ marginLeft: SIDEBAR_W }}
      >
        <header className="h-14 bg-white px-4 flex items-center justify-between border-b border-slate-200 sticky top-0 z-20">
          <h2 className="text-[20px] leading-6 font-semibold font-archivo text-slate-700">
            {pageTitle}
          </h2>

          <div className="relative" ref={acctRef}>
            <button
              type="button"
              onClick={() => setAcctOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={acctOpen}
              className="flex items-center gap-3 px-6 cursor-pointer"
            >
              <div className="h-9 w-9 rounded-full bg-[#CFE1FF] grid place-items-center">
                <span className="font-archivo text-[18px] leading-none font-medium text-[#0F172A]">
                  {(profile?.username?.[0] || "A").toUpperCase()}
                </span>
              </div>
              <span className="font-archivo text-[16px] leading-6 font-medium text-[#0F172A] underline underline-offset-[6px] decoration-[1.5px]">
                {profile?.username ?? "Admin"}
              </span>
            </button>

            {acctOpen && (
              <div
                role="menu"
                className="absolute right-2 top-12 z-50 w-[224px] rounded-md border border-slate-200 bg-white shadow-xl overflow-hidden"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAcctOpen(false);
                    router.push("/admin/account");
                  }}
                  className="w-full h-[42px] px-4 flex items-center gap-2.5 font-archivo text-[14px] text-slate-700 hover:bg-gray-100 cursor-pointer"
                >
                  My Account
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAcctOpen(false);
                    setLogoutOpen(true);
                  }}
                  className="w-full h-[42px] px-4 flex items-center gap-2.5 font-archivo text-[14px] text-red-600 hover:bg-red-100 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        <main
          className="px-6 py-6 overflow-y-auto"
          style={{ height: "calc(100svh - 56px)" }}
        >
          {children}
        </main>
      </div>

      {logoutOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => !loggingOut && setLogoutOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-title"
              className="w-[400px] h-[160px] max-w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
            >
              <div className="p-6 h-full flex flex-col">
                <h3
                  id="logout-title"
                  className="font-archivo text-[18px] leading-7 font-semibold text-slate-900"
                >
                  Logout
                </h3>
                <p className="mt-2 font-archivo text-[14px] leading-6 text-slate-500">
                  Are you sure you want to log out?
                </p>
                <div className="mt-auto flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setLogoutOpen(false)}
                    disabled={!!loggingOut}
                    className="h-10 px-4 text-[14px] rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmLogout}
                    disabled={!!loggingOut}
                    className="h-10 px-5 text-[14px] rounded-lg bg-blue-600 text-white hover:opacity-95 disabled:opacity-60 cursor-pointer"
                  >
                    {loggingOut ? "Logging out…" : "Logout"}
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
