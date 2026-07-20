import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

import { labelStatus } from "@/features/admin/utils";

export function StatusBadge({ status }: { status: string }) {
  if (status === "submitted") {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full border border-[#D79525]/30 bg-[#F6E8D2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#83540C]">
        {labelStatus(status)}
      </span>
    );
  }
  if (status === "under_review") {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full border border-[#9A6516]/30 bg-[#E6C992] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5F3A05]">
        {labelStatus(status)}
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full border border-emerald-700/20 bg-[#DDEBE1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#315D40]">
        {labelStatus(status)}
      </span>
    );
  }
  if (status === "refused") {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full border border-red-700/20 bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-800">
        {labelStatus(status)}
      </span>
    );
  }
  const positive = ["approved", "handled", "contacted", "registered"].includes(
    status,
  );
  const warning = [
    "submitted",
    "new",
    "under_review",
    "in_progress",
    "waitlisted",
  ].includes(status);
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${positive ? "border-emerald-700/20 bg-emerald-100 text-emerald-800" : warning ? "border-primary-600/20 bg-primary-100 text-primary-800" : "border-[#D9CDBE] bg-[#F1E8DC] text-[#655D55]"}`}
    >
      {labelStatus(status)}
    </span>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-primary-800">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#171411] md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-[#756B61]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// for django administration
export function ManageLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold text-primary-800 shadow-sm transition-colors hover:bg-[#FFF9F1]"
    >
      {children}
      <ExternalLink size={14} />
    </a>
  );
}

export function AdminPageLoading() {
  return (
    <div className="animate-pulse px-5 py-8 md:px-8">
      <div className="h-9 w-64 rounded bg-[#DDD1C2]" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-36 rounded-2xl bg-[#F4ECE1]" />
        ))}
      </div>
    </div>
  );
}

export function AdminPageState({
  isLoading,
  hasData,
  children,
}: {
  isLoading: boolean;
  hasData: boolean;
  children: ReactNode;
}) {
  if (isLoading) return <AdminPageLoading />;
  if (!hasData)
    return (
      <div className="grid min-h-[50vh] place-items-center text-[#6D645B]">
        Dashboard data is unavailable.
      </div>
    );
  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 text-[#221E1A] md:px-8 md:py-9">
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[#CFC1B0] bg-white/45 px-5 py-10 text-center text-sm text-[#746A60]">
      {children}
    </div>
  );
}
