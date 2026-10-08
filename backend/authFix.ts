import mysql from "mysql2/promise";
import { proto } from "baileys";
import { config } from "./config";

/**
 * Workaround for a bug in the `mysql-baileys` auth store.
 *
 * Its keys.get() passes app-state-sync-key rows through its own fromObject(),
 * which only keeps keyData when `Array.isArray(keyData)` is true. The row is
 * stored as a base64 string, so that check fails and it falls back to
 * allocate(), a stub returning a zero-filled array of the right *length* but
 * none of the real bytes. Baileys then AES-decrypts every app-state snapshot
 * with a 32-byte zero key and fails with "bad decrypt" — which silently breaks
 * contact syncing entirely.
 *
 * The stored row itself is correct, so we re-read it and decode it properly.
 * Upstream: github:bobslavtriev/mysql-baileys (lib/Utils/index.js, fromObject).
 */

let pool: mysql.Pool | undefined;
const getPool = (): mysql.Pool =>
  (pool ??= mysql.createPool({ ...config.mysql, connectionLimit: 4 }));

/** Decode a Buffer field regardless of which serialisation shape it was stored in. */
const toBuffer = (v: unknown): Buffer => {
  if (Buffer.isBuffer(v)) return v;
  if (typeof v === "string") return Buffer.from(v, "base64");
  if (v && typeof v === "object") {
    const d = (v as { data?: unknown }).data;
    if (Buffer.isBuffer(d)) return d;
    if (typeof d === "string") return Buffer.from(d, "base64");
    if (Array.isArray(d)) return Buffer.from(d as number[]);
  }
  return Buffer.alloc(0);
};

export type AppStateSyncKey = ReturnType<typeof proto.Message.AppStateSyncKeyData.fromObject>;

/** Read and correctly decode one app-state-sync-key for a session. */
export async function readAppStateSyncKey(
  session: string,
  id: string
): Promise<AppStateSyncKey | undefined> {
  try {
    const [rows] = await getPool().query(
      "SELECT value FROM auth WHERE session = ? AND id = ? LIMIT 1",
      [session, `app-state-sync-key-${id}`]
    );
    const row = (rows as { value?: unknown }[])[0];
    if (!row?.value) return undefined;

    const parsed = (
      typeof row.value === "string" ? JSON.parse(row.value) : row.value
    ) as {
      keyData?: unknown;
      timestamp?: unknown;
      fingerprint?: { rawId?: number; currentIndex?: number; deviceIndexes?: number[] };
    };

    const keyData = toBuffer(parsed.keyData);
    if (keyData.length === 0) return undefined;

    const f = parsed.fingerprint ?? {};
    return proto.Message.AppStateSyncKeyData.fromObject({
      keyData,
      fingerprint: {
        rawId: f.rawId ?? 0,
        // The library also mistakenly wrote rawId into currentIndex here.
        currentIndex: f.currentIndex ?? 0,
        deviceIndexes: Array.isArray(f.deviceIndexes) ? f.deviceIndexes : [],
      },
      timestamp: Number(parsed.timestamp ?? 0),
    });
  } catch (e) {
    console.error(`readAppStateSyncKey failed for ${session}/${id}:`, e);
    return undefined;
  }
}

/**
 * Patch a mysql-baileys key store so app-state-sync-key reads bypass the
 * broken decoder. Every other key type is left untouched.
 */
export function withWorkingAppStateKeys<T extends { get: Function }>(
  keys: T,
  session: string
): T {
  const originalGet = keys.get.bind(keys);
  keys.get = async (type: string, ids: string[]) => {
    if (type !== "app-state-sync-key") return originalGet(type, ids);
    const out: Record<string, AppStateSyncKey | undefined> = {};
    for (const id of ids) out[id] = await readAppStateSyncKey(session, id);
    return out;
  };
  return keys;
}
