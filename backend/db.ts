import { Pool } from "pg";
import { config } from "./config";

const pool = new Pool(config.postgres);
pool.on("error", (err) => console.error("Postgres pool error:", err));

export async function initDb(): Promise<void> {
  const attempts = 5;
  for (let i = 1; i <= attempts; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id           BIGSERIAL PRIMARY KEY,
          username     TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          on_whatsapp  BOOLEAN NOT NULL,
          message      TEXT NOT NULL,
          created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      await pool.query(
        "CREATE INDEX IF NOT EXISTS messages_username_idx ON messages (username);"
      );
      // 'direct' = sent to a phone number, 'group' = sent to a group jid.
      // Existing rows predate group sending, so 'direct' is the right default.
      await pool.query(
        "ALTER TABLE messages ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'direct';"
      );
      console.log("Connected to Postgres");
      return;
    } catch (e) {
      console.error(`Postgres init attempt ${i}/${attempts} failed:`, e);
      if (i < attempts) await new Promise((r) => setTimeout(r, 3000));
    }
  }
  console.error("Postgres unavailable — message logging is disabled until it recovers");
}

export type MessageKind = "direct" | "group";

export async function insertMessage(
  username: string,
  phoneNumber: string,
  onWhatsapp: boolean,
  message: string,
  kind: MessageKind = "direct"
): Promise<void> {
  await pool.query(
    `INSERT INTO messages (username, phone_number, on_whatsapp, message, kind)
     VALUES ($1, $2, $3, $4, $5)`,
    [username, phoneNumber, onWhatsapp, message, kind]
  );
}

export async function getSummary(username: string): Promise<{
  totalMessages: number;
  totalGroupMessages: number;
  totalUsersUniqueWhatsAppUsers: number;
  totalUsersUniqueNonWhatsAppUsers: number;
}> {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*)::int                                                 AS total,
       COUNT(*) FILTER (WHERE kind = 'group')::int                   AS group_total,
       COUNT(DISTINCT phone_number)
         FILTER (WHERE on_whatsapp AND kind = 'direct')::int         AS on_wa,
       COUNT(DISTINCT phone_number)
         FILTER (WHERE NOT on_whatsapp AND kind = 'direct')::int     AS off_wa
     FROM messages
     WHERE username = $1`,
    [username]
  );
  return {
    totalMessages: rows[0].total,
    totalGroupMessages: rows[0].group_total,
    // Contact tallies are meaningless for group jids, so they exclude them.
    totalUsersUniqueWhatsAppUsers: rows[0].on_wa,
    totalUsersUniqueNonWhatsAppUsers: rows[0].off_wa,
  };
}
