import type { ReactNode } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

export function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.24em] text-primary-800">IPC member area</p><h1 className="mt-2 text-3xl font-black tracking-[-.03em] text-[#171411] md:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#756B61]">{description}</p></div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-5 text-[#221E1A] shadow-[0_8px_25px_rgba(66,48,31,0.05)] ${className}`}>{children}</section>;
}

export function Status({ value }: { value: string }) {
  const positive = ["approved", "active", "confirmed", "attended", "resolved"].includes(value);
  const caution = ["draft", "pending", "waitlisted", "more_info_required"].includes(value);
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${positive ? "bg-emerald-50 text-emerald-700" : caution ? "bg-amber-50 text-amber-800" : "bg-background-100 text-foreground-700"}`}>{value.replaceAll("_", " ")}</span>;
}

export function Loading() {
  return <div className="grid min-h-56 place-items-center" role="status"><LoaderCircle className="animate-spin text-primary-600" /><span className="sr-only">Loading</span></div>;
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <Card className="text-center"><AlertCircle className="mx-auto text-red-600" /><h2 className="mt-3 font-semibold">We could not load this section</h2><p className="mt-1 text-sm text-foreground-600">{message}</p>{retry && <button className="btn-primary mt-4" onClick={retry}>Try again</button>}</Card>;
}

export function Empty({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-dashed border-background-300 px-5 py-10 text-center"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-foreground-600">{text}</p></div>;
}

export const inputClass = "mt-1.5 w-full rounded-xl border border-background-300 bg-white px-3.5 py-2.5 text-sm text-[#221E1A] placeholder:text-[#91867C] outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-200";
