"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { me } from "@/lib/auth";

export default function AccountPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await me();
        if (alive) setProfile(u || null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const username = profile?.username ?? "";
  const password = profile?.password ?? "";
  const role = profile?.role ?? "";

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
      <section className="rounded-[12px] border border-slate-200 bg-white shadow-sm pb-10 sm:pb-14">
        <div className="p-6 sm:p-8">
          <h2 className="text-center font-archivo text-lg sm:text-xl font-semibold text-slate-900">
            User Profile
          </h2>

          <div className="mt-6 flex justify-center">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#CFE1FF] grid place-items-center">
              <span className="font-archivo text-base sm:text-lg font-medium text-[#0F172A]">
                {(username?.[0] || "U").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4 max-w-[560px] mx-auto w-full">
            {/* Username */}
            <div className="grid grid-cols-1 sm:grid-cols-[140px_16px_1fr] items-center gap-2">
              <label className="font-archivo text-sm sm:text-[14px] leading-[22px] text-slate-700">
                Username
              </label>
              <span className="hidden sm:block text-slate-500">:</span>
              <input
                value={loading ? "" : username}
                readOnly
                disabled
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-4 font-archivo text-sm text-slate-900"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-[140px_16px_1fr] items-center gap-2">
              <label className="font-archivo text-sm sm:text-[14px] leading-[22px] text-slate-700">
                Password
              </label>
              <span className="hidden sm:block text-slate-500">:</span>
              <input
                value={loading ? "" : password}
                readOnly
                disabled
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-4 font-archivo text-sm text-slate-900"
              />
            </div>

            {/* Role */}
            <div className="grid grid-cols-1 sm:grid-cols-[140px_16px_1fr] items-center gap-2">
              <label className="font-archivo text-sm sm:text-[14px] leading-[22px] text-slate-700">
                Role
              </label>
              <span className="hidden sm:block text-slate-500">:</span>
              <input
                value={loading ? "" : role}
                readOnly
                disabled
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-4 font-archivo text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/admin/articles"
              className="inline-flex items-center justify-center rounded-md bg-[#2563EB] px-5 py-2.5 font-archivo text-sm sm:text-[14px] font-medium text-white hover:opacity-95 transition"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
