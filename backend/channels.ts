import { Pool } from "pg";
import { config } from "./config";

/**
 * Postgres-backed list of the WhatsApp Channels (newsletters) a session manages.
 *
 * Baileys can create, inspect and post to a channel, but has no call that lists
 * the channels an account owns, so every channel created or imported through
 * the app is remembered here.
 */

const pool = new Pool(config.postgres);
pool.on("error", (err) => console.error("Channels pool error:", err));

export interface StoredChannel {
  jid: string;
  name: string;
  description: string;
  /** Invite code; the public link is https://whatsapp.com/channel/<invite>. */
  invite: string;
  createdAt: string;
}

export async function initChannelsTable(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS channels (
        username    TEXT NOT NULL,
        jid         TEXT NOT NULL,
        name        TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        invite      TEXT NOT NULL DEFAULT '',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (username, jid)
      );
    `);
  } catch (e) {
    console.error("Failed to init channels table:", e);
  }
}

export async function saveChannel(
  username: string,
  channel: Omit<StoredChannel, "createdAt">
): Promise<void> {
  await pool.query(
    `INSERT INTO channels (username, jid, name, description, invite)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (username, jid) DO UPDATE
       SET name = EXCLUDED.name,
           description = EXCLUDED.description,
           invite = EXCLUDED.invite`,
    [username, channel.jid, channel.name, channel.description, channel.invite]
  );
}

const toChannel = (r: any): StoredChannel => ({
  jid: r.jid,
  name: r.name,
  description: r.description,
  invite: r.invite,
  createdAt: new Date(r.created_at).toISOString(),
});

export async function listChannels(username: string): Promise<StoredChannel[]> {
  const { rows } = await pool.query(
    `SELECT jid, name, description, invite, created_at
       FROM channels
      WHERE username = $1
      ORDER BY created_at DESC`,
    [username]
  );
  return rows.map(toChannel);
}

export async function getChannel(
  username: string,
  jid: string
): Promise<StoredChannel | undefined> {
  const { rows } = await pool.query(
    `SELECT jid, name, description, invite, created_at
       FROM channels
      WHERE username = $1 AND jid = $2`,
    [username, jid]
  );
  return rows[0] ? toChannel(rows[0]) : undefined;
}

/** Forget a channel locally. The channel itself is left untouched on WhatsApp. */
export async function removeChannel(username: string, jid: string): Promise<void> {
  await pool.query("DELETE FROM channels WHERE username = $1 AND jid = $2", [
    username,
    jid,
  ]);
}
