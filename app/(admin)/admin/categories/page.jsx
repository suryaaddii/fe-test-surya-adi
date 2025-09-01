"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/axios";
import Pagination from "@/components/Pagination";
import useDebounce from "@/hooks/useDebounce";

export default function CategoriesPage() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ----- Delete modal -----
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ----- Edit modal -----
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ id: null, name: "" });
  const [savingId, setSavingId] = useState(null);
  const editInputRef = useRef(null);
  const [editTried, setEditTried] = useState(false);

  // ----- Add modal -----
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const addInputRef = useRef(null);
  const [addTried, setAddTried] = useState(false);

  // ✅ debounce biar gak request tiap ketik
  const debouncedSearch = useDebounce(search, 400);

  // Formatter waktu WIB
  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    []
  );

  async function fetchData(p = 1, s = "") {
    setLoading(true);
    try {
      const { data } = await api.get("/categories", {
        params: { page: p, limit },
      });

      let items = Array.isArray(data?.data) ? data.data : [];

      // ✅ frontend-only filter berdasarkan search
      if (s) {
        items = items.filter((item) =>
          item.name?.toLowerCase().includes(s.toLowerCase())
        );
      }

      items = items.slice().sort((a, b) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });

      const totalPages =
        data?.totalPages ??
        (data?.totalData ? Math.max(1, Math.ceil(data.totalData / limit)) : 1);

      setRows(items);
      setPage(data?.currentPage ?? p);
      setLastPage(totalPages || 1);
      setTotal(data?.totalData ?? items.length);
    } finally {
      setLoading(false);
    }
  }

  // pertama kali load
  useEffect(() => {
    fetchData(1);
  }, []);

  // trigger ulang kalau debouncedSearch berubah
  useEffect(() => {
    fetchData(1, debouncedSearch);
  }, [debouncedSearch]);

  // auto refresh tiap 30 detik
  useEffect(() => {
    const t = setInterval(() => fetchData(page, debouncedSearch), 30000);
    return () => clearInterval(t);
  }, [page, debouncedSearch]);

  // esc close modal
  useEffect(() => {
    if (!confirmOpen && !editOpen && !addOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !deletingId && !savingId && !savingNew) {
        setConfirmOpen(false);
        setEditOpen(false);
        setAddOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen, editOpen, addOpen, deletingId, savingId, savingNew]);

  // autofocus edit
  useEffect(() => {
    if (editOpen) {
      const t = setTimeout(() => editInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [editOpen]);

  // autofocus add
  useEffect(() => {
    if (addOpen) {
      const t = setTimeout(() => addInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [addOpen]);

  // ----- Delete handlers -----
  function onDelete(id) {
    const cat = rows.find((r) => r.id === id);
    setSelected({ id, name: cat?.name || "" });
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!selected?.id) return;
    try {
      setDeletingId(selected.id);
      await api.delete(`/categories/${selected.id}`);
      const nextPage = rows.length === 1 && page > 1 ? page - 1 : page;
      await fetchData(nextPage, debouncedSearch);
      setConfirmOpen(false);
      setSelected(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  // ----- Edit handlers -----
  function openEdit(cat) {
    setEditData({ id: cat.id, name: cat.name || "" });
    setEditTried(false);
    setEditOpen(true);
  }

  async function saveEdit(e) {
    e?.preventDefault?.();
    setEditTried(true);
    const n = (editData.name || "").trim();
    if (!n) {
      editInputRef.current?.reportValidity?.();
      editInputRef.current?.focus();
      return;
    }
    try {
      setSavingId(editData.id);
      await api.put(`/categories/${editData.id}`, { name: n });
      await fetchData(page, debouncedSearch);
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  // ----- Add handlers -----
  function openAdd() {
    setNewName("");
    setAddTried(false);
    setAddOpen(true);
  }

  async function saveAdd(e) {
    e?.preventDefault?.();
    setAddTried(true);
    const n = (newName || "").trim();
    if (!n) {
      addInputRef.current?.reportValidity?.();
      addInputRef.current?.focus();
      return;
    }
    try {
      setSavingNew(true);
      await api.post("/categories", { name: n });
      await fetchData(1, debouncedSearch);
      setAddOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create. Please try again.");
    } finally {
      setSavingNew(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1240px]">
      {/* Card utama */}
      <section className="rounded-[12px] border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200">
          <p className="font-archivo text-[16px] leading-5 font-medium">
            Total Categories :{" "}
            <span className="font-medium text-slate-700">{total}</span>
          </p>
        </div>

        {/* Search + Add */}
        <div className="px-5 py-4 border-b border-slate-200 font-archivo">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 w-full">
            <div className="relative max-w-[240px] w-full">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Category"
                className="pl-9 pr-3 h-9 w-full rounded-md border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 font-archivo"
              />
            </div>

            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 font-archivo text-sm font-medium text-white hover:opacity-95 cursor-pointer"
            >
              + Add Category
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto font-archivo text-[14px] leading-[20px]">
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col className="w-[40%]" />
              <col className="w-[20%]" />
              <col className="w-[40%]" />
            </colgroup>

            <thead className="bg-gray-100">
              <tr className="text-slate-900">
                <th className="px-5 py-3 font-medium text-center">Category</th>
                <th className="px-2 py-3 font-medium text-center">
                  Created at
                </th>
                <th className="px-5 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-6 text-slate-500 text-center"
                  >
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-6 text-slate-500 text-center"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="align-middle hover:bg-slate-50/60">
                    <td className="px-10 py-3 text-center text-slate-800">
                      {c.name}
                    </td>
                    <td className="px-2 py-3 text-center text-slate-600 whitespace-nowrap">
                      {c.createdAt ? fmt.format(new Date(c.createdAt)) : "-"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="inline-flex items-center gap-4 text-[12px] leading-5">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="text-[#2563EB] hover:opacity-80 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(c.id)}
                          className="text-red-500 hover:text-red-600 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-200 px-5 py-3">
          {Number.isFinite(lastPage) && lastPage > 1 && (
            <div className="flex items-center justify-center">
              <Pagination
                page={page}
                lastPage={lastPage}
                onPage={(p) => fetchData(p, debouncedSearch)}
              />
            </div>
          )}
        </div>
      </section>

      {/* ===== Modal Delete ===== */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => !deletingId && setConfirmOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-title"
              className="w-[400px] h-[180px] max-w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
            >
              <div className="p-6 h-full flex flex-col">
                <h3
                  id="delete-title"
                  className="font-archivo text-[18px] leading-7 font-semibold text-slate-900"
                >
                  Delete Category
                </h3>
                <p className="mt-2 font-archivo text-[14px] leading-6 text-slate-500">
                  Delete category{" "}
                  <span className="font-medium text-slate-700">
                    “{selected?.name}”
                  </span>
                  ? This will remove it permanently.
                </p>
                <div className="mt-auto flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(false)}
                    disabled={!!deletingId}
                    className="h-10 px-4 text-[14px] rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={!!deletingId}
                    className="h-10 px-5 text-[14px] rounded-lg bg-[#E11D48] text-white hover:bg-[#DC1F3A] disabled:opacity-60 cursor-pointer"
                  >
                    {deletingId ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Modal Edit ===== */}
      {editOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => !savingId && setEditOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-title"
              className="w-[400px] h-[240px] max-w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
            >
              <form onSubmit={saveEdit} className="p-6 h-full flex flex-col">
                <h3
                  id="edit-title"
                  className="font-archivo text-[20px] leading-7 font-semibold text-slate-900"
                >
                  Edit Category
                </h3>
                <div className="mt-4 flex-1">
                  <label
                    htmlFor="edit-category"
                    className="block font-archivo text-[14px] leading-6 font-medium text-slate-700 mb-2"
                  >
                    Category
                  </label>
                  <input
                    id="edit-category"
                    ref={editInputRef}
                    value={editData.name}
                    onChange={(e) =>
                      setEditData((d) => ({ ...d, name: e.target.value }))
                    }
                    placeholder="Technology"
                    disabled={!!savingId}
                    required
                    minLength={1}
                    onInvalid={(e) => {
                      e.currentTarget.setCustomValidity("Category is required");
                      setEditTried(true);
                    }}
                    onInput={(e) => {
                      e.currentTarget.setCustomValidity("");
                      if (editTried) setEditTried(false);
                    }}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 font-archivo text-[14px] leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB] disabled:bg-slate-50"
                  />
                  {editTried && !editData.name.trim() && (
                    <p className="mt-1 text-[12px] leading-5 text-red-600">
                      Category field cannot be empty
                    </p>
                  )}
                </div>
                <div className="mt-auto flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    disabled={!!savingId}
                    className="h-10 px-4 text-[14px] rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!!savingId}
                    className="h-10 px-5 text-[14px] rounded-lg bg-[#2563EB] text-white hover:opacity-95 disabled:opacity-60 font-archivo cursor-pointer"
                  >
                    {savingId ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===== Modal Add ===== */}
      {addOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => !savingNew && setAddOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-title"
              className="w-[400px] h-[240px] max-w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
            >
              <form onSubmit={saveAdd} className="p-6 h-full flex flex-col">
                <h3
                  id="add-title"
                  className="font-archivo text-[20px] leading-7 font-semibold text-slate-900"
                >
                  Add Category
                </h3>
                <div className="mt-4 flex-1">
                  <label
                    htmlFor="add-category"
                    className="block font-archivo text-[14px] leading-6 font-medium text-slate-700 mb-2"
                  >
                    Category
                  </label>
                  <input
                    id="add-category"
                    ref={addInputRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Input Category"
                    disabled={!!savingNew}
                    required
                    minLength={1}
                    onInvalid={(e) => {
                      e.currentTarget.setCustomValidity("Category is required");
                      setAddTried(true);
                    }}
                    onInput={(e) => {
                      e.currentTarget.setCustomValidity("");
                      if (addTried) setAddTried(false);
                    }}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 font-archivo text-[14px] leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/15 focus:border-[#2563EB] disabled:bg-slate-50"
                  />
                  {addTried && !newName.trim() && (
                    <p className="mt-1 text-[12px] leading-5 text-red-600">
                      Category is required
                    </p>
                  )}
                </div>
                <div className="mt-auto flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddOpen(false)}
                    disabled={!!savingNew}
                    className="h-10 px-4 text-[14px] rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!!savingNew}
                    className="h-10 px-5 text-[14px] rounded-lg bg-blue-600 text-white hover:opacity-95 disabled:opacity-60 font-archivo cursor-pointer"
                  >
                    {savingNew ? "Adding…" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
