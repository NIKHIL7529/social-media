const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function fileToDataUrl(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return Promise.reject(new Error("Image size too large. Maximum size is 10MB."));
  }
  if (!IMAGE_ACCEPT.split(",").includes(file.type)) {
    return Promise.reject(new Error("Please choose a JPEG, PNG, WebP, or GIF image."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
