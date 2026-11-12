import makeWASocket, {
  AnyMessageContent,
  AuthenticationState,
  DisconnectReason,
  delay,
  fetchLatestBaileysVersion,
} from "baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import QRCode from "qrcode";
import WebSocket from "ws";
import { useMySQLAuthState } from "mysql-baileys";
import { config } from "./config";
import { upsertContacts } from "./contacts";
import { withWorkingAppStateKeys } from "./authFix";

/** Last QR data-url per username, so a page refresh can re-show it. */
export const qrs: Record<string, string> = {};

/** Open WebSocket connections per username (a user may have several tabs). */
const userConnections: Record<string, Set<WebSocket>> = {};

export const addUserConnection = (username: string, ws: WebSocket): void => {
  (userConnections[username] ??= new Set()).add(ws);
};

export const removeConnection = (ws: WebSocket): void => {
  for (const username of Object.keys(userConnections)) {
    userConnections[username].delete(ws);
    if (userConnections[username].size === 0) delete userConnections[username];
  }
};

export const sendToUser = (username: string, payload: object): void => {
  for (const ws of userConnections[username] ?? []) {
    try {
      ws.send(JSON.stringify(payload));
    } catch (e) {
      console.error(`ws send failed for ${username}:`, e);
    }
  }
};

export class BaileysProvider {
  name: string;
  mysock: ReturnType<typeof makeWASocket> | undefined;
  private removeCredsGlobal: (() => Promise<void>) | undefined;

  constructor(name: string) {
    this.name = name;
    this.initBailey().catch((e) =>
      console.error(`initBailey failed for ${name}:`, e)
    );
  }

  sendMessageWTyping = async (msg: AnyMessageContent, jid: string): Promise<void> => {
    if (!this.mysock) throw new Error(`${this.name}: WhatsApp socket not connected`);
    await this.mysock.presenceSubscribe(jid);
    await delay(500);
    await this.mysock.sendPresenceUpdate("composing", jid);
    await delay(2000);
    await this.mysock.sendPresenceUpdate("paused", jid);
    await this.mysock.sendMessage(jid, msg);
  };

  /**
   * Force WhatsApp to re-push the address book.
   *
   * Contacts live in the 'critical_unblock_low' app-state collection. A plain
   * resync only asks for mutations *since* the stored sync version, so a
   * session that synced long ago receives an empty delta and no contacts.
   * WhatsApp only returns a full snapshot when the requested version is 0
   * (see `return_snapshot` in Baileys' resyncAppState), so clearing the stored
   * version first is what forces the whole address book to be re-sent. This is
   * the same reset Baileys itself performs when a patch fails to apply.
   */
  resyncContacts = async (full = true): Promise<void> => {
    if (!this.mysock) throw new Error(`${this.name}: WhatsApp socket not connected`);
    if (full) {
      await this.mysock.authState.keys.set({
        "app-state-sync-version": { critical_unblock_low: null },
      });
      console.log(`${this.name}: cleared contact sync version, requesting snapshot`);
    }
    await this.mysock.resyncAppState(["critical_unblock_low"], false);
  };

  initBailey = async (): Promise<void> => {
    const { state, saveCreds, removeCreds } = await useMySQLAuthState({
      ...config.mysql,
      session: this.name,
    });
    this.removeCredsGlobal = removeCreds;
    // mysql-baileys returns a zero-filled app-state-sync-key, which makes every
    // contact/app-state snapshot fail to decrypt. See authFix.ts.
    withWorkingAppStateKeys(state.keys, this.name);
    try {
      const { version } = await fetchLatestBaileysVersion();
      const sock = makeWASocket({
        version,
        printQRInTerminal: false,
        // mysql-baileys ships slightly older baileys types (no "lid-mapping"
        // signal key); the runtime shape is compatible.
        auth: state as unknown as AuthenticationState,
        markOnlineOnConnect: false,
        syncFullHistory: false,
        //@ts-ignore pino version mismatch between baileys and this project
        logger: pino({ level: config.baileysLogLevel }),
      });

      sock.ev.on("connection.update", async (update) => {
        try {
          const { connection, lastDisconnect, qr } = update;
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

          if (connection === "close") {
            if (statusCode === DisconnectReason.loggedOut) {
              // Session was logged out from the phone: wipe stored creds so we
              // start a fresh QR pairing instead of looping on stale creds.
              console.log(`${this.name}: logged out, removing credentials`);
              await this.removeCredsGlobal?.().catch((e) =>
                console.error(`${this.name}: removeCreds failed:`, e)
              );
            }
            this.mysock = undefined;
            this.initBailey().catch((e) =>
              console.error(`reconnect failed for ${this.name}:`, e)
            );
          }

          if (connection === "open") {
            console.log(`${this.name} is : ready`);
            delete qrs[this.name];
            this.mysock = sock;
            sendToUser(this.name, { type: "authenticated" });
          }

          // WhatsApp rotates the QR every ~20s; when a socket's QR refs run out
          // it closes with a timeout and the reconnect above emits a fresh one,
          // so the page always has a scannable code until the device links.
          if (qr) {
            const url = await QRCode.toDataURL(qr);
            qrs[this.name] = url;
            sendToUser(this.name, { type: "qr-code", message: url });
          }
        } catch (e) {
          console.error(`${this.name}: connection.update handler error:`, e);
        }
      });

      /* Contacts: initial sync delivers them here, in bulk. */
      sock.ev.on("messaging-history.set", async ({ contacts }) => {
        try {
          if (!contacts?.length) return;
          const n = await upsertContacts(this.name, contacts);
          if (n) console.log(`${this.name}: stored ${n} contacts from history sync`);
        } catch (e) {
          console.error(`${this.name}: contact history sync failed:`, e);
        }
      });

      /* Contacts: incremental additions and edits after the initial sync. */
      sock.ev.on("contacts.upsert", async (contacts) => {
        try {
          const n = await upsertContacts(this.name, contacts);
          if (n) console.log(`${this.name}: +${n} contact(s)`);
        } catch (e) {
          console.error(`${this.name}: contacts.upsert failed:`, e);
        }
      });

      sock.ev.on("contacts.update", async (contacts) => {
        try {
          await upsertContacts(this.name, contacts);
        } catch (e) {
          console.error(`${this.name}: contacts.update failed:`, e);
        }
      });

      sock.ev.on("creds.update", async () => {
        try {
          await saveCreds();
        } catch (e) {
          console.error(`${this.name}: saveCreds failed:`, e);
        }
      });
    } catch (e) {
      console.error(`${this.name}: initBailey error:`, e);
    }
  };
}

export const bailey: Record<string, BaileysProvider> = {};

export const getOrCreateProvider = (username: string): BaileysProvider =>
  (bailey[username] ??= new BaileysProvider(username));
