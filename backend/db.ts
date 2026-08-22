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
      console.log("Connected to Postgres");
      return;
    } catch (e) {
      console.error(`Postgres init attempt ${i}/${attempts} failed:`, e);
      if (i < attempts) await new Promise((r) => setTimeout(r, 3000));
    }
  }
  console.error("Postgres unavailable — message logging is disabled until it recovers");
}

export async function insertMessage(
  username: string,
  phoneNumber: string,
  onWhatsapp: boolean,
  message: string
): Promise<void> {
  await pool.query(
    `INSERT INTO messages (username, phone_number, on_whatsapp, message)
     VALUES ($1, $2, $3, $4)`,
    [username, phoneNumber, onWhatsapp, message]
  );
}

export async function getSummary(username: string): Promise<{
  totalMessages: number;
  totalUsersUniqueWhatsAppUsers: number;
  totalUsersUniqueNonWhatsAppUsers: number;
}> {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*)::int                                                        AS total,
       COUNT(DISTINCT phone_number) FILTER (WHERE on_whatsapp)::int         AS on_wa,
       COUNT(DISTINCT phone_number) FILTER (WHERE NOT on_whatsapp)::int     AS off_wa
     FROM messages
     WHERE username = $1`,
    [username]
  );
  return {
    totalMessages: rows[0].total,
    totalUsersUniqueWhatsAppUsers: rows[0].on_wa,
    totalUsersUniqueNonWhatsAppUsers: rows[0].off_wa,
  };
}
