"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-line px-3 font-normal placeholder:font-normal outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft";

export function TextField({
  label,
  onChange,
  required,
  type = "text",
  value,
  leadingIcon,
  error,
  ...inputProps
}: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
  leadingIcon?: ReactNode;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  const errorId = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const decorated = Boolean(leadingIcon) || isPassword;
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <span className={decorated ? "relative mt-2 block" : "block"}>
        {leadingIcon && <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-ink-muted">{leadingIcon}</span>}
        <input {...inputProps} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : inputProps["aria-describedby"]} type={isPassword && visible ? "text" : type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className={`${inputClass}${decorated ? " !mt-0" : ""}${leadingIcon ? " !pl-12" : ""}${isPassword ? " !pr-12" : ""}`} />
        {isPassword && <button type="button" disabled={inputProps.disabled} onMouseDown={(event) => event.preventDefault()} onClick={() => setVisible(!visible)} aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible} className="absolute inset-y-0 right-0 grid w-11 place-items-center border-0 bg-transparent text-ink-muted !transform-none !shadow-none outline-none ring-0 transition-none focus:outline-none focus:ring-0">
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>}
      </span>
      {error && <span id={errorId} role="alert" className="mt-2 block text-xs font-medium leading-relaxed text-red-700">{error}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  onChange,
  value,
  error,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
  error?: string;
}) {
  const errorId = useId();
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <textarea aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} min-h-24 py-2`} />
      {error && <span id={errorId} role="alert" className="mt-2 block text-xs font-medium leading-relaxed text-red-700">{error}</span>}
    </label>
  );
}

export function SelectField({
  children,
  label,
  onChange,
  required,
  value,
  error,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
  error?: string;
}) {
  const errorId = useId();
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <select
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={`${inputClass} bg-white`}
      >
        {children}
      </select>
      {error && <span id={errorId} role="alert" className="mt-2 block text-xs font-medium leading-relaxed text-red-700">{error}</span>}
    </label>
  );
}
