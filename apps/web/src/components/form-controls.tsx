"use client";

import type { ReactNode } from "react";

const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-line px-3 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft";

export function TextField({
  label,
  onChange,
  required,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className={inputClass} />
    </label>
  );
}

export function TextAreaField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} min-h-24 py-2`} />
    </label>
  );
}

export function SelectField({
  children,
  label,
  onChange,
  required,
  value,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={`${inputClass} bg-white`}
      >
        {children}
      </select>
    </label>
  );
}
