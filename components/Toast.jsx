"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Toast({ type = "success", message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose && onClose(), 3000); // auto-close 3 detik
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles =
    type === "success"
      ? "bg-green-50 border-green-200 text-green-800"
      : "bg-red-50 border-red-200 text-red-800";

  const Icon = type === "success" ? CheckCircle2 : XCircle;

  return (
    <div
      className={`fixed top-5 right-5 z-50 rounded-lg border px-4 py-3 shadow-lg flex items-center gap-3 ${styles}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="font-medium text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-slate-500 hover:text-slate-700"
      >
        ✕
      </button>
    </div>
  );
}
