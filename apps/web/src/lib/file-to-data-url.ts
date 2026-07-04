const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export function fileToDataUrl(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return Promise.reject(new Error("Image size too large. Maximum size is 10MB."));
  }
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("Please choose an image file."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
