import type { ImageLoaderProps } from "next/image";

export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src.includes("res.cloudinary.com")) {
    return src;
  }

  const transformation = `f_auto,q_${quality || "auto"},c_limit,w_${width}`;
  return src.replace("/upload/", `/upload/${transformation}/`);
}
