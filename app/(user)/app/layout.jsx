"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { me, logout } from "@/lib/auth";
import { LogOut } from "lucide-react";

export default function UserLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const segs = pathname.split("/").filter(Boolean);
  const idx = segs.indexOf("articles");
  const isList = idx >= 0 && idx === segs.length - 1;
  const isDetail = idx >= 0 && idx === segs.length - 2;

  const headerLogoSrc = isList ? "/logoipsum2.svg" : "/logoipsum.svg";

  const headerLogoClass = `${isList ? "h-8" : "h-6"} w-auto block shrink-0`;

  const nameTextClass = isList ? "text-white" : "text-[#0F172A]";
  const avatarBgClass = isList
    ? "bg-white/20 ring-1 ring-white/30"
    : "bg-[#CFE1FF]";
  const avatarInitialClass = isList ? "text-white" : "text-[#0F172A]";

  const footerLogoSrc = "/logoipsum2.svg";
  const footerLogoClass = "h-8 w-auto block shrink-0";

  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await me();
        if (u.role !== "User") {
          router.replace("/user/articles");
          return;
        }
        setProfile(u);
        setReady(true);
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);

  // Dropdown & modal logout
  const [acctOpen, setAcctOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const acctRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (acctRef.current && !acctRef.current.contains(e.target))
        setAcctOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setAcctOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  if (!ready) return null;

  return (
    <div className="min-h-svh bg-slate-50">
      {/* NAVBAR */}
      <header className="absolute inset-x-0 top-0 z-30 bg-transparent">
        <div className="mx-auto max-w-[1240px] h-14 px-4 flex items-center justify-between">
          <Link
            href="/user/articles"
            className="flex items-center"
            aria-label="Go to articles list"
          >
            <img src={headerLogoSrc} alt="Logo" className={headerLogoClass} />
          </Link>

          <div className="relative" ref={acctRef}>
            <button
              type="button"
              onClick={() => setAcctOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={acctOpen}
              className="flex items-center gap-3 px-2 cursor-pointer"
            >
              {/* Avatar bulat biru */}
              <div
                className={`h-9 w-9 rounded-full grid place-items-center ${avatarBgClass}`}
              >
                <span
                  className={`font-archivo text-[18px] leading-none font-medium ${avatarInitialClass}`}
                >
                  {(profile?.username?.[0] || "U").toUpperCase()}
                </span>
              </div>

              {/* Nama user: hanya muncul di desktop */}
              <span
                className={`hidden sm:inline font-archivo text-[16px] leading-6 font-medium ${nameTextClass} underline underline-offset-[6px] decoration-[1.5px]`}
              >
                {profile?.username ?? "User"}
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
                    router.push("/app/account");
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
        </div>
      </header>

      {/* CONTENT */}
      <main className="py-6">{children}</main>

      {/* LOGOUT MODAL */}
      {logoutOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setLogoutOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-[400px] h-[180px] max-w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              <div className="p-6 h-full flex flex-col">
                <h3 className="font-archivo text-[18px] font-semibold text-slate-900">
                  Log out
                </h3>
                <p className="mt-2 text-[14px] text-slate-500">
                  Are you sure you want to log out?
                </p>
                <div className="mt-auto flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setLogoutOpen(false)}
                    className="h-10 px-4 text-[14px] rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      router.replace("/login");
                    }}
                    className="h-10 px-5 text-[14px] rounded-lg bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="relative bg-[#2563EB] text-white">
        <div className="mx-auto max-w-[1240px] py-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-1">
          <Link
            href="/user/articles"
            className="flex items-center gap-2"
            aria-label="Back to articles list"
          >
            <img src={footerLogoSrc} alt="Logo" className={footerLogoClass} />
          </Link>
          <span className="text-white/90 text-sm sm:text-base leading-none text-center">
            ©{new Date().getFullYear()} Blog genzet. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
