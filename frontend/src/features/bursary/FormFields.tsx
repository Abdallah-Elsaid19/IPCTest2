import type { ReactNode } from "react";
import {
  Controller,
  useFormContext,
  type FieldPath,
  type RegisterOptions,
} from "react-hook-form";

import type { BursaryApplicationFormValues } from "./schema";

const inputClass =
  "min-h-12 min-w-0 w-full max-w-full rounded-xl border bg-white px-4 py-3 text-sm text-background-950 outline-none transition placeholder:text-foreground-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";

function errorAt(
  errors: Record<string, unknown>,
  path: string,
): string | undefined {
  const value = path.split(".").reduce<unknown>(
    (current, segment) =>
      current && typeof current === "object"
        ? (current as Record<string, unknown>)[segment]
        : undefined,
    errors,
  );
  if (!value || typeof value !== "object") return undefined;
  const message = (value as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

export function FieldShell({
  name,
  label,
  required,
  helper,
  children,
  wide,
}: {
  name: FieldPath<BursaryApplicationFormValues>;
  label: string;
  required?: boolean;
  helper?: string;
  children: (props: { id: string; error?: string; describedBy?: string }) => ReactNode;
  wide?: boolean;
}) {
  const { formState: { errors } } = useFormContext<BursaryApplicationFormValues>();
  const id = `bursary-${name.replaceAll(".", "-")}`;
  const error = errorAt(errors as unknown as Record<string, unknown>, name);
  const describedBy = [helper ? `${id}-help` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`min-w-0 w-full ${wide ? "md:col-span-2" : ""}`}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-background-950">
        {label}
        {required && <span className="ml-1 text-primary-700" aria-hidden="true">*</span>}
      </label>
      {children({ id, error, describedBy })}
      {helper && <p id={`${id}-help`} className="mt-1.5 text-xs leading-5 text-foreground-500">{helper}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}

export function TextField({
  name,
  label,
  type = "text",
  required,
  helper,
  placeholder,
  wide,
  inputMode,
  autoComplete,
  disabled,
  registerOptions,
}: {
  name: FieldPath<BursaryApplicationFormValues>;
  label: string;
  type?: "text" | "email" | "url" | "date" | "number" | "tel";
  required?: boolean;
  helper?: string;
  placeholder?: string;
  wide?: boolean;
  inputMode?: "text" | "email" | "url" | "tel" | "decimal";
  autoComplete?: string;
  disabled?: boolean;
  registerOptions?: RegisterOptions<BursaryApplicationFormValues>;
}) {
  const { register } = useFormContext<BursaryApplicationFormValues>();
  return (
    <FieldShell {...{ name, label, required, helper, wide }}>
      {({ id, error, describedBy }) => (
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          disabled={disabled}
          className={`${inputClass} ${error ? "border-red-500" : "border-background-300"} disabled:cursor-not-allowed disabled:bg-background-100`}
          {...register(name, registerOptions)}
        />
      )}
    </FieldShell>
  );
}

export function NumberField({
  name,
  label,
  required,
  helper,
}: {
  name: FieldPath<BursaryApplicationFormValues>;
  label: string;
  required?: boolean;
  helper?: string;
}) {
  return (
    <TextField
      name={name}
      label={label}
      type="number"
      inputMode="decimal"
      required={required}
      helper={helper}
      registerOptions={{
        setValueAs: (value) => value === "" ? undefined : Number(value),
      }}
    />
  );
}

export function SelectField({
  name,
  label,
  options,
  required,
  helper,
  disabled,
}: {
  name: FieldPath<BursaryApplicationFormValues>;
  label: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  helper?: string;
  disabled?: boolean;
}) {
  const { register } = useFormContext<BursaryApplicationFormValues>();
  return (
    <FieldShell {...{ name, label, required, helper }}>
      {({ id, error, describedBy }) => (
        <select
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${inputClass} ${error ? "border-red-500" : "border-background-300"} disabled:cursor-not-allowed disabled:bg-background-100`}
          {...register(name)}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function TextareaField({
  name,
  label,
  required,
  helper,
  rows = 5,
}: {
  name: FieldPath<BursaryApplicationFormValues>;
  label: string;
  required?: boolean;
  helper?: string;
  rows?: number;
}) {
  const { register } = useFormContext<BursaryApplicationFormValues>();
  return (
    <FieldShell {...{ name, label, required, helper }} wide>
      {({ id, error, describedBy }) => (
        <textarea
          id={id}
          rows={rows}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${inputClass} resize-y ${error ? "border-red-500" : "border-background-300"}`}
          {...register(name)}
        />
      )}
    </FieldShell>
  );
}

export function RadioGroup({
  name,
  legend,
  options,
  required,
}: {
  name: FieldPath<BursaryApplicationFormValues>;
  legend: string;
  options: Array<{ value: string | boolean; label: string }>;
  required?: boolean;
}) {
  const { control, formState: { errors } } = useFormContext<BursaryApplicationFormValues>();
  const error = errorAt(errors as unknown as Record<string, unknown>, name);
  const id = `bursary-${name.replaceAll(".", "-")}`;
  return (
    <fieldset className="md:col-span-2">
      <legend className="mb-3 text-sm font-semibold text-background-950">
        {legend}{required && <span className="ml-1 text-primary-700" aria-hidden="true">*</span>}
      </legend>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="grid gap-3 sm:grid-cols-3">
            {options.map((option) => (
              <label key={String(option.value)} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-background-300 bg-white px-4 py-3 text-sm hover:border-primary-500 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50">
                <input
                  type="radio"
                  name={field.name}
                  value={String(option.value)}
                  checked={field.value === option.value}
                  onChange={() => field.onChange(option.value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className="h-4 w-4 accent-[oklch(var(--primary-600))]"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        )}
      />
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-700">{error}</p>}
    </fieldset>
  );
}

export function ConsentCheckbox({
  name,
  title,
  copy,
  optional,
}: {
  name: FieldPath<BursaryApplicationFormValues>;
  title?: string;
  copy: string;
  optional?: boolean;
}) {
  const { register, formState: { errors } } = useFormContext<BursaryApplicationFormValues>();
  const error = errorAt(errors as unknown as Record<string, unknown>, name);
  const id = `bursary-${name.replaceAll(".", "-")}`;
  return (
    <div>
      <label htmlFor={id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${error ? "border-red-400 bg-red-50" : "border-background-300 bg-white hover:border-primary-500"}`}>
        <input
          id={id}
          type="checkbox"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[oklch(var(--primary-600))]"
          {...register(name)}
        />
        <span>
          {title && <strong className="block text-sm text-background-950">{title}</strong>}
          <span className="mt-1 block text-sm leading-6 text-foreground-700">
            {copy}{optional ? " (Optional)" : <span className="ml-1 text-primary-700" aria-hidden="true">*</span>}
          </span>
        </span>
      </label>
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-xl border-l-4 border-primary-500 bg-primary-50 px-5 py-4 text-sm leading-6 text-foreground-700">
      {children}
    </aside>
  );
}

export function StepHeading({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8">
      <h2 className="text-2xl font-semibold text-background-950 md:text-3xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground-600">{intro}</p>
      {children && <div className="mt-5">{children}</div>}
    </header>
  );
}
