"use client";
export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder={placeholder || "Search..."}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
