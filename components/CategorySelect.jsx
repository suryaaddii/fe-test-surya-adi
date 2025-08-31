"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

export default function CategorySelect({ value, onChange }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api
      .get("/categories", { params: { page: 1, limit: 100 } })
      .then((r) => setItems(r.data?.data ?? []))
      .catch(() => setItems([]));
  }, []);
  return (
    <select
      className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
    >
      <option value="">Category</option>
      {items.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
