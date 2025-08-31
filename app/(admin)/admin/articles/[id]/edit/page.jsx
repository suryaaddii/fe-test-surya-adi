"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Undo2,
  Bold,
  Italic,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

const schema = z.object({
  title: z.string().trim().min(5, "Please enter title"),
  categoryId: z.string().min(1, "Please select category"),
  content: z.string().trim().min(20, "Content field cannot empty"),
});

export default function AdminArticleEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { title: "", categoryId: "", content: "" },
  });

  const content = watch("content") || "";
  const words = useMemo(
    () => (content.trim() ? content.trim().split(/\s+/).length : 0),
    [content]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [catsRes, artRes] = await Promise.all([
          api.get("/categories", { params: { page: 1, limit: 100 } }),
          api.get(`/articles/${id}`),
        ]);
        if (!alive) return;

        setCats(catsRes.data?.data ?? []);
        const raw = artRes.data?.data ?? artRes.data ?? {};
        reset({
          title: raw.title ?? "",
          categoryId: String(raw.categoryId ?? raw.category?.id ?? ""),
          content: raw.content ?? "",
        });
      } catch (e) {
        console.error(e);
        alert("Failed to load article.");
        router.replace("/admin/articles");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, reset, router]);

  async function onSubmit(values) {
    try {
      await api.put(`/articles/${id}`, values);
      alert("Article updated successfully!");
      router.push("/admin/articles");
    } catch (error) {
      console.error("Error updating article:", error);
      alert(
        "Failed to update article: " +
          (error.response?.data?.message || error.message)
      );
    }
  }

  function onError(errors) {
    const first = Object.keys(errors)[0];
    if (first) {
      const element = document.querySelector(`[name="${first}"]`);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1240px]">
        <section className="rounded-[12px] border border-slate-200 bg-white shadow-sm min-h-[240px] grid place-items-center">
          <p className="text-slate-500">Loading…</p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1240px]">
      <section className="rounded-[12px] border border-slate-200 bg-white shadow-sm min-h-[720px]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <Link
            href="/admin/articles"
            className="text-slate-500 hover:text-slate-700"
          >
            ←
          </Link>
          <h1 className="text-[16px] leading-7 font-medium font-archivo text-slate-900">
            Edit Articles
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          noValidate
          className="p-6 space-y-5"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1 font-archivo">
              Title
            </label>
            <input
              {...register("title")}
              placeholder="Input title"
              className={`h-12 w-full rounded-lg border p-3.5 font-archivo text-[14px] focus:outline-none focus:ring-4 ${
                errors.title
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
              }`}
            />
            {errors.title && (
              <p role="alert" className="text-sm text-red-600 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1 font-archivo">
              Category
            </label>
            <select
              {...register("categoryId")}
              className={`h-12 w-full rounded-lg border p-3.5 font-archivo focus:outline-none focus:ring-4 ${
                errors.categoryId
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
              }`}
            >
              <option value="">Select category</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p role="alert" className="text-sm text-red-600 mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1 font-archivo">
              Content
            </label>
            <div className="h-10 rounded-t-lg border-x border-t border-slate-200 bg-white px-2 flex items-center gap-2 text-slate-600">
              <button type="button" className="p-2 hover:bg-slate-100 rounded">
                <Undo2 className="h-4 w-4" />
              </button>
              <span className="h-6 w-px bg-slate-200" />
              <button type="button" className="p-2 hover:bg-slate-100 rounded">
                <Bold className="h-4 w-4" />
              </button>
              <button type="button" className="p-2 hover:bg-slate-100 rounded">
                <Italic className="h-4 w-4" />
              </button>
              <button type="button" className="p-2 hover:bg-slate-100 rounded">
                <List className="h-4 w-4" />
              </button>
              <span className="h-6 w-px bg-slate-200" />
              <button type="button" className="p-2 hover:bg-slate-100 rounded">
                <AlignLeft className="h-4 w-4" />
              </button>
              <button type="button" className="p-2 hover:bg-slate-100 rounded">
                <AlignCenter className="h-4 w-4" />
              </button>
              <button type="button" className="p-2 hover:bg-slate-100 rounded">
                <AlignRight className="h-4 w-4" />
              </button>
            </div>
            <textarea
              {...register("content")}
              rows={14}
              placeholder="Type a content..."
              className={`w-full rounded-b-lg border p-3.5 font-archivo focus:outline-none focus:ring-4 ${
                errors.content
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:ring-[#2563EB]/10 focus:border-[#2563EB]"
              }`}
            />
            <p className="text-[12px] text-slate-500 mt-1">{words} Words</p>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <div className="flex items-center justify-end gap-3">
              <Link
                href="/admin/articles"
                className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-900 hover:bg-slate-100
                           text-sm font-medium flex items-center justify-center cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={() => window.alert("Preview not implemented in task")}
                className="h-10 px-4 rounded-lg bg-slate-200 text-slate-900 hover:bg-slate-100
                           text-sm font-medium flex items-center justify-center cursor-pointer"
              >
                Preview
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60
                           inline-flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
              >
                {isSubmitting ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
