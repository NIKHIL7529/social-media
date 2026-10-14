"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";

import { fileToDataUrl, IMAGE_ACCEPT } from "@/lib/file-to-data-url";

export function ImageUploadField({
  aspectClass = "aspect-[4/3]",
  emptyText,
  error,
  helperText,
  label,
  onChange,
  preview,
  required,
}: {
  aspectClass?: string;
  emptyText: string;
  error?: string;
  helperText?: string;
  label: string;
  onChange: (dataUrl: string) => void;
  preview: string;
  required?: boolean;
}) {
  const errorId = useId();
  const [uploadError, setUploadError] = useState("");
  const selection = useRef(0);
  const message = uploadError || error;
  return (
    <div>
      <label className="block cursor-pointer overflow-hidden rounded border border-dashed border-line bg-surface-raised focus-within:ring-2 focus-within:ring-accent">
        <input
          aria-label={label}
          aria-invalid={Boolean(message)}
          aria-describedby={message ? errorId : undefined}
          required={required}
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={async (event) => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            if (!file) return;
            const selected = ++selection.current;
            setUploadError("");
            try {
              const dataUrl = await fileToDataUrl(file);
              if (selected === selection.current) onChange(dataUrl);
            } catch (error) {
              if (selected !== selection.current) return;
              input.value = "";
              const message = error instanceof Error ? error.message : "Could not read image. Please choose another photo.";
              setUploadError(message);
              toast.error(message);
            }
          }}
          className="sr-only"
        />
        <div className={`relative grid ${aspectClass} place-items-center`}>
          {preview ? (
            <Image src={preview} alt={label} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex flex-col items-center gap-3 text-ink-muted">
              <span className="grid size-14 place-items-center rounded bg-surface text-accent-deep shadow-soft">
                <Camera />
              </span>
              <span className="font-bold">{emptyText}</span>
              {helperText && <span className="text-sm">{helperText}</span>}
            </div>
          )}
        </div>
      </label>
      {message && <span id={errorId} role="alert" className="mt-2 block text-xs font-medium leading-relaxed text-danger">{message}</span>}
    </div>
  );
}
