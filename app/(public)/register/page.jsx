"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { register as registerApi, login, me } from "@/lib/auth";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  username: z.string().min(3, "Username field cannot be empty"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["User", "Admin"], { required_error: "Select a role" }),
});

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    try {
      // 1) Register (API mengembalikan 201 tanpa token)
      await registerApi(values);

      // 2) Login untuk mendapatkan token
      await login({ username: values.username, password: values.password });

      // 3) Ambil profil untuk tahu role
      const user = await me();

      // 4) Redirect sesuai role
      router.replace(
        user.role === "Admin" ? "/admin/articles" : "/app/articles"
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Register failed";
      alert(msg);
    }
  };

  return (
    <main className="min-h-svh bg-[#F3F5F7] flex items-center justify-center px-4">
      <div className="w-[400px] rounded-[12px] bg-white shadow-sm border border-slate-200 px-4 py-10">
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/logoipsum.svg"
            alt="Logoipsum"
            width={134}
            height={24}
            priority
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Input username"
              autoComplete="username"
              {...register("username")}
              className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Input password"
                autoComplete="new-password"
                {...register("password")}
                className="w-full h-11 rounded-lg border border-slate-200 bg-white pr-10 px-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-600" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-2">
              Role
            </label>
            <select
              defaultValue=""
              {...register("role")}
              className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-lg bg-[#2563EB] text-white font-medium hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Footer link */}
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#2563EB] underline cursor-pointer"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
