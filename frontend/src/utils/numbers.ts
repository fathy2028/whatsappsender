/** Non-empty, trimmed entries from a pasted recipient list. */
export function parseNumbers(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((n) => n.trim())
    .filter(Boolean);
}
