const CLOUDINARY_MARKER = "res.cloudinary.com";

/**
 * Inserts an f_auto,q_auto:good,w_<width> transformation into a Cloudinary delivery URL
 * so images are served already resized/compressed for how they're actually displayed,
 * instead of the full original upload. Non-Cloudinary URLs (local /public assets,
 * external stock photo fallbacks) are returned unchanged.
 */
export function optimizeImageUrl(url: string | null | undefined, width: number): string {
  if (!url) return "";
  if (!url.includes(CLOUDINARY_MARKER) || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto:good,w_${width}/`);
}
