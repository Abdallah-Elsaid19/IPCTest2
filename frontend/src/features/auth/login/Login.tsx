import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { LANDING_BACKGROUND_VIDEO } from "@/config/media";
import { notifications } from "@/lib/notifications";
import { useAuth } from "../AuthContext";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .max(254, "Email address is too long")
    .refine((value) => /^[^\s@]+@[^\s@]+$/.test(value), "Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const submitLock = useRef(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    if (submitLock.current) return;
    submitLock.current = true;
    try {
      const user = await login(values);
      notifications.signedIn(user.name);
      const requestedPath = (location.state as { from?: string } | null)?.from;
      navigate(requestedPath || (user.is_staff ? "/admin" : "/home"), { replace: true });
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Please try again.");
    } finally {
      submitLock.current = false;
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background-950 px-4 py-4 sm:px-8 sm:py-5">
      <video
        src={LANDING_BACKGROUND_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-background-950/50" />
      <div className="absolute inset-0 dot-grid-gold opacity-10" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[566px] flex-col justify-center sm:min-h-[calc(100vh-2.5rem)]">
        <section
          className="w-full border border-background-700/40 bg-background-950/30 px-6 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-[54px] sm:py-9"
          aria-labelledby="login-title"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="text-base font-bold tracking-[-0.02em] text-background-200 transition-colors hover:text-background-50">
              Institute of Project Controls
            </Link>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.48em] text-primary-500">
              Member Portal
            </span>
          </div>

          <div className="mt-6 h-px w-full bg-gradient-to-r from-primary-500/10 via-primary-500 to-primary-500/10" />

          <div className="mt-6">
            <h1 id="login-title" className="text-4xl font-bold leading-tight tracking-[-0.04em] text-background-50">Sign in</h1>
            <p className="mt-1.5 max-w-md text-base leading-6 text-background-300">
              Access your membership profile, applications, and professional records.
            </p>
          </div>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-wide text-background-300">Email address</label>
              <div className="relative">
                <Mail size={19} strokeWidth={1.8} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-background-500" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="h-[52px] w-full border border-background-700 bg-background-900/80 pl-14 pr-4 text-base text-background-50 outline-none transition placeholder:text-background-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  {...register("email")}
                />
              </div>
              {errors.email && <p id="email-error" className="mt-2 text-xs text-red-300">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-background-300">Password</label>
                <Link to="/contact" className="text-xs text-background-400 transition-colors hover:text-primary-500">Forgot password?</Link>
              </div>
              <div className="relative">
                <LockKeyhole size={19} strokeWidth={1.8} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-background-500" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="h-[52px] w-full border border-background-700 bg-background-900/80 pl-14 pr-14 text-base text-background-50 outline-none transition placeholder:text-background-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 grid w-14 place-items-center text-background-500 transition-colors hover:text-background-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="mt-2 text-xs text-red-300">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="flex h-14 w-full items-center justify-center gap-3 bg-primary-500 text-base font-bold text-background-950 transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
              {isSubmitting ? "Signing in…" : "Sign in"}
              {!isSubmitting && <ArrowRight size={19} strokeWidth={2.5} aria-hidden="true" />}
            </button>
          </form>

          <div className="my-6 flex items-center gap-5" aria-hidden="true">
            <span className="h-px flex-1 bg-background-700/60" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-background-500">Or</span>
            <span className="h-px flex-1 bg-background-700/60" />
          </div>

          <p className="text-center text-sm text-background-300">
            Not a member yet?{" "}
            <Link to="/membership" className="font-semibold text-primary-500 transition-colors hover:text-primary-400">
              Explore membership
            </Link>
          </p>
        </section>

        <p className="mt-4 text-center text-xs leading-5 text-background-500">
          By signing in you agree to the Institute&apos;s{" "}
          <Link to="/privacy" className="border-b border-background-500/60 text-background-400 transition-colors hover:border-primary-500 hover:text-primary-500">
            Privacy &amp; Policies
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
