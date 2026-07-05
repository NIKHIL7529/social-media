"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";

import { fileToDataUrl } from "@/lib/file-to-data-url";

export function ImageUploadField({
  aspectClass = "aspect-[4/3]",
  emptyText,
  helperText,
  label,
  onChange,
  preview,
  required,
}: {
  aspectClass?: string;
  emptyText: string;
  helperText?: string;
  label: string;
  onChange: (dataUrl: string) => void;
  preview: string;
  required?: boolean;
}) {
  return (
    <label className="block cursor-pointer overflow-hidden rounded-lg border border-dashed border-line bg-slate-50">
      <input
        required={required}
        type="file"
        accept="image/*"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          try {
            onChange(await fileToDataUrl(file));
          } catch (error) {
            event.currentTarget.value = "";
            toast.error(error instanceof Error ? error.message : "Could not read image");
          }
        }}
        className="sr-only"
      />
      <div className={`relative grid ${aspectClass} place-items-center`}>
        {preview ? (
          <Image src={preview} alt={label} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex flex-col items-center gap-3 text-ink-muted">
            <span className="grid size-14 place-items-center rounded-full bg-white text-accent-deep shadow-soft">
              <Camera />
            </span>
            <span className="font-bold">{emptyText}</span>
            {helperText && <span className="text-sm">{helperText}</span>}
          </div>
        )}
      </div>
    </label>
  );
}
