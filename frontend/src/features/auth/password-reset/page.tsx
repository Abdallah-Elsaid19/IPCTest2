import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { adminApi } from "@/features/admin/adminApi";
import { notifications } from "@/lib/notifications";
import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";

const schema = z
  .object({
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export default function PasswordResetPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const uid = params.get("uid") || "";
  const token = params.get("token") || "";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const validLink = Boolean(uid && token);

  const submit = async ({ password }: FormValues) => {
    try {
      await adminApi.confirmPasswordReset({ uid, token, password });
      notifications.success(
        "Password updated successfully. You can now sign in.",
      );
      navigate("/login", { replace: true });
    } catch (error) {
      notifications.error(
        error instanceof Error
          ? error.message
          : "The password could not be updated.",
      );
    }
  };

  return (
    <main className="grid min-h-[100svh] place-items-center bg-[#0B0B0B] px-3 py-5 sm:px-4 sm:py-8">
      <SEO {...pageSeo.resetPassword} />
      <section className="w-full max-w-lg border border-white/15 bg-[#11100F] p-7 text-white shadow-2xl sm:p-10">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-500 text-[#0B0B0B]">
            <LockKeyhole size={20} />
          </span>
          <div>
            <p className="font-bold">Institute of Project Controls</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary-500">
              Secure account recovery
            </p>
          </div>
        </div>
        <div className="my-7 h-px bg-gradient-to-r from-primary-700 via-primary-500 to-transparent" />
        <h1 className="text-3xl font-black">Set a new password</h1>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Choose a strong password that you do not use on another website.
        </p>

        {!validLink ? (
          <div className="mt-7 rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-200">
            This password-reset link is incomplete. Request a new password-reset
            email from the sign-in page.
          </div>
        ) : (
          <form onSubmit={handleSubmit(submit)} className="mt-7 space-y-5">
            <label className="block text-xs font-bold uppercase tracking-wide text-white/70">
              New password
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password")}
                  className="h-12 w-full border border-white/20 bg-white/5 px-4 pr-12 text-sm outline-none focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-white/50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="mt-1.5 block text-[11px] normal-case text-red-300">
                  {errors.password.message}
                </span>
              )}
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-white/70">
              Confirm password
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirmPassword")}
                className="mt-2 h-12 w-full border border-white/20 bg-white/5 px-4 text-sm outline-none focus:border-primary-500"
              />
              {errors.confirmPassword && (
                <span className="mt-1.5 block text-[11px] normal-case text-red-300">
                  {errors.confirmPassword.message}
                </span>
              )}
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 bg-primary-500 font-bold text-[#0B0B0B] transition hover:bg-primary-400 disabled:opacity-60"
            >
              {isSubmitting && (
                <LoaderCircle size={17} className="animate-spin" />
              )}
              Set new password
            </button>
          </form>
        )}
        <p className="mt-7 text-center text-xs text-white/45">
          <Link
            to={validLink ? "/login" : "/forgot-password"}
            className="font-bold text-primary-500 hover:text-primary-400"
          >
            {validLink ? "Return to sign in" : "Request a new link"}
          </Link>
        </p>
      </section>
    </main>
  );
}
