/** Human-readable file size. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

/** Mirrors the backend's mime dispatch in contentForUpload() (backend/index.ts). */
export function mediaKind(file: File): "image" | "video" | "audio" | "file" {
  const m = (file.type || "").toLowerCase();
  if (m.startsWith("image/")) return "image";
  if (m.startsWith("video/")) return "video";
  if (m.startsWith("audio/")) return "audio";
  return "file";
}

/** Matches the backend's MESSAGE_DELAY_MIN/MAX_MS defaults. */
const DELAY_MIN_S = 60;
const DELAY_MAX_S = 120;

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

/** Rough completion window, since the per-message pause is randomised. */
export function estimateRange(remaining: number): string {
  if (remaining <= 1) return "under a minute";
  const gaps = remaining - 1;
  return `${formatDuration(gaps * DELAY_MIN_S)} – ${formatDuration(gaps * DELAY_MAX_S)}`;
}
