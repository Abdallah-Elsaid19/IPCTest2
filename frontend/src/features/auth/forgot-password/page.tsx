import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import SEO from "@/components/seo/SEO";
import { LANDING_BACKGROUND_VIDEO } from "@/config/media";
import { pageSeo } from "@/config/pageSeo";
import { notifications } from "@/lib/notifications";
import { authApi } from "../authApi";

const schema = z.object({
  email: z.string().trim().min(1, "IPC email address is required").email("Enter a valid IPC email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [destination, setDestination] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const submit = async ({ email }: FormValues) => {
    try {
      const response = await authApi.requestPasswordReset(email);
      setDestination(response.destination || "your personal email address");
      notifications.success(response.detail);
    } catch (error) {
      setDestination("");
      notifications.error(error instanceof Error ? error.message : "The reset request could not be completed.");
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background-950 px-4 py-8">
      <SEO {...pageSeo.forgotPassword} />
      <video src={LANDING_BACKGROUND_VIDEO} autoPlay loop muted playsInline aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background-950/75" />
      <section className="relative z-10 w-full max-w-lg border border-background-700/50 bg-background-950/80 p-7 text-background-50 shadow-2xl backdrop-blur-md sm:p-10">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-500 text-background-950"><LockKeyhole size={20} /></span>
          <div>
            <p className="font-bold">Institute of Project Controls</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary-500">Secure account recovery</p>
          </div>
        </div>
        <div className="my-7 h-px bg-gradient-to-r from-primary-700 via-primary-500 to-transparent" />
        <h1 className="text-3xl font-black">Forgot your password?</h1>
        <p className="mt-2 text-sm leading-6 text-background-300">
          Enter your IPC email address. If it matches an active account, we will send a secure reset link to the personal email registered with your membership application.
        </p>

        {destination ? (
          <div className="mt-7 border border-primary-500/30 bg-primary-500/10 p-5 text-sm leading-6 text-background-100" role="status">
            A password-reset link has been sent to <strong className="text-primary-400">{destination}</strong>. The link is single-use and expires shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit(submit)} className="mt-7 space-y-5" noValidate>
            <div>
              <label htmlFor="ipc-email" className="mb-2 block text-xs font-bold uppercase tracking-wide text-background-300">IPC email address</label>
              <div className="relative">
                <Mail size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-background-500" aria-hidden="true" />
                <input
                  id="ipc-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="your.name@ipc.invalid"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "ipc-email-error" : undefined}
                  className="h-13 w-full border border-background-700 bg-background-900/80 py-3 pl-12 pr-4 text-sm text-background-50 outline-none placeholder:text-background-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  {...register("email")}
                />
              </div>
              {errors.email && <p id="ipc-email-error" className="mt-2 text-xs text-red-300">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="inline-flex h-12 w-full items-center justify-center gap-2 bg-primary-500 font-bold text-background-950 transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
              {isSubmitting ? "Sending reset link…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-xs text-background-500">
          <Link to="/login" className="inline-flex items-center gap-2 font-bold text-primary-500 hover:text-primary-400"><ArrowLeft size={14} /> Return to sign in</Link>
        </p>
      </section>
    </main>
  );
}
