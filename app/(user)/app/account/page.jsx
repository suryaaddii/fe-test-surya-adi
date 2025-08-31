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
    <div className="mx-auto w-full max-w-[1240px]">
      {/* Card utama */}
      <section className="py-27">
        <div className="p-6 sm:p-8">
          {/* Title tengah */}
          <h2 className="text-center font-archivo text-[18px] leading-7 font-semibold text-slate-900">
            User Profile
          </h2>

          {/* Avatar */}
          <div className="mt-6 flex justify-center">
            <div className="h-14 w-14 rounded-full bg-[#CFE1FF] grid place-items-center">
              <span className="font-archivo text-[18px] leading-none font-medium text-[#0F172A]">
                {(username?.[0] || "U").toUpperCase()}
              </span>
            </div>
          </div>

          {/* Detail rows */}
          <div className="mt-6 space-y-3 max-w-[560px] mx-auto">
            {/* Username */}
            <div className="grid grid-cols-[140px_16px_1fr] items-center gap-2">
              <label className="font-archivo text-[14px] leading-[22px] text-slate-700">
                Username
              </label>
              <span className="text-slate-500">:</span>
              <input
                value={loading ? "" : username}
                readOnly
                disabled
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-4 font-archivo text-[14px] leading-[22px] text-slate-900"
              />
            </div>

            {/* Password (readonly) */}
            <div className="grid grid-cols-[140px_16px_1fr] items-center gap-2">
              <label className="font-archivo text-[14px] leading-[22px] text-slate-700">
                Password
              </label>
              <span className="text-slate-500">:</span>
              <input
                value={loading ? "" : password}
                readOnly
                disabled
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-4 font-archivo text-[14px] leading-[22px] text-slate-900"
              />
            </div>

            {/* Role */}
            <div className="grid grid-cols-[140px_16px_1fr] items-center gap-2">
              <label className="font-archivo text-[14px] leading-[22px] text-slate-700">
                Role
              </label>
              <span className="text-slate-500">:</span>
              <input
                value={loading ? "" : role}
                readOnly
                disabled
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-4 font-archivo text-[14px] leading-[22px] text-slate-900"
              />
            </div>
          </div>

          {/* Back button */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/app/articles"
              className="inline-flex items-center justify-center rounded-md bg-[#2563EB] px-5 py-2.5 font-archivo text-[14px] leading-[22px] font-medium text-white hover:opacity-95"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
