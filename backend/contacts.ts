import { Pool } from "pg";
import { config } from "./config";

/**
 * Postgres-backed contact store.
 *
 * Baileys v7 removed makeInMemoryStore, so contacts have to be captured from
 * the socket's events and persisted ourselves. Contacts arrive via
 * 'messaging-history.set' on initial sync and 'contacts.upsert'/'contacts.update'
 * afterwards; a session that paired long ago only re-delivers them when
 * resyncAppState(['critical_unblock_low']) is called.
 */

const pool = new Pool(config.postgres);
pool.on("error", (err) => console.error("Contacts pool error:", err));

export interface StoredContact {
  jid: string;
  phoneNumber: string;
  name: string;
  /** True when you saved this contact in your own address book. */
  saved: boolean;
}

/** Shape of the Contact objects Baileys emits. */
interface BaileysContact {
  id?: string;
  lid?: string;
  phoneNumber?: string;
  name?: string;
  notify?: string;
  verifiedName?: string;
}

export async function initContactsTable(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        username     TEXT NOT NULL,
        jid          TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        name         TEXT,
        notify       TEXT,
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (username, jid)
      );
    `);
    await pool.query(
      "CREATE INDEX IF NOT EXISTS contacts_username_idx ON contacts (username);"
    );
  } catch (e) {
    console.error("Failed to init contacts table:", e);
  }
}

/** Digits only — group jids and broadcast ids are rejected by the caller. */
const jidToNumber = (jid: string): string => jid.split("@")[0].split(":")[0].replace(/\D/g, "");

/**
 * Upsert a batch of contacts. Only real user jids are kept: groups, status
 * broadcasts and LID-only entries without a phone number are skipped.
 *
 * A null/absent `name` never overwrites a previously stored one — contacts.update
 * events are partial and would otherwise wipe saved names.
 */
export async function upsertContacts(
  username: string,
  contacts: BaileysContact[]
): Promise<number> {
  const rows = contacts
    .map((c) => {
      const jid = c.phoneNumber || c.id || "";
      if (!jid.includes("@s.whatsapp.net")) return null;
      const number = jidToNumber(jid);
      if (!number) return null;
      return {
        jid: `${number}@s.whatsapp.net`,
        number,
        name: c.name ?? null,
        notify: c.notify ?? c.verifiedName ?? null,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length === 0) return 0;

  // De-duplicate within the batch: ON CONFLICT cannot hit the same row twice.
  const unique = new Map(rows.map((r) => [r.jid, r]));
  const values = [...unique.values()];

  try {
    const params: unknown[] = [];
    const tuples = values.map((r, i) => {
      const b = i * 5;
      params.push(username, r.jid, r.number, r.name, r.notify);
      return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5})`;
    });
    await pool.query(
      `INSERT INTO contacts (username, jid, phone_number, name, notify)
       VALUES ${tuples.join(", ")}
       ON CONFLICT (username, jid) DO UPDATE SET
         name       = COALESCE(EXCLUDED.name, contacts.name),
         notify     = COALESCE(EXCLUDED.notify, contacts.notify),
         updated_at = now()`,
      params
    );
    return values.length;
  } catch (e) {
    console.error(`Failed to upsert ${values.length} contacts for ${username}:`, e);
    return 0;
  }
}

/**
 * List a session's contacts.
 * savedOnly=true returns just those with a name you saved in your address book.
 */
export async function listContacts(
  username: string,
  savedOnly = false
): Promise<StoredContact[]> {
  const { rows } = await pool.query(
    `SELECT jid, phone_number, name, notify
       FROM contacts
      WHERE username = $1
        ${savedOnly ? "AND name IS NOT NULL AND name <> ''" : ""}
      ORDER BY (name IS NULL), lower(COALESCE(name, notify, phone_number))`,
    [username]
  );
  return rows.map((r) => ({
    jid: r.jid,
    phoneNumber: r.phone_number,
    name: r.name || r.notify || r.phone_number,
    saved: Boolean(r.name),
  }));
}

export async function countContacts(username: string): Promise<{ total: number; saved: number }> {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE name IS NOT NULL AND name <> '')::int AS saved
       FROM contacts WHERE username = $1`,
    [username]
  );
  return { total: rows[0].total, saved: rows[0].saved };
}
