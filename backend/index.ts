import { config } from "./config";
import { AnyMessageContent, delay } from "baileys";
import reader from "xlsx";
import path from "path";
import express from "express";
import fileUpload from "express-fileupload";
import WebSocket from "ws";
import http from "http";
import cors from "cors";
import mysql from "mysql2";
import { initDb, insertMessage, getSummary } from "./db";
import {
  BaileysProvider,
  bailey,
  qrs,
  getOrCreateProvider,
  addUserConnection,
  removeConnection,
} from "./baileys";
import { normalizePhoneNumber, toJid, isValidUsername } from "./phone";
import { createJob, finishJob, getJob, getJobs, BulkJob } from "./jobs";

interface IGroup {
  id: string;
  name: string;
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    limits: { fileSize: config.maxUploadMb * 1024 * 1024 },
    abortOnLimit: true,
  })
);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/* ── Startup: restore existing sessions ─────────────────────────────────── */

function getUsernames(): Promise<string[]> {
  const connection = mysql.createConnection(config.mysql);
  // Fatal connection errors also surface via the query callback; without this
  // listener they are additionally emitted as uncaught 'error' events.
  connection.on("error", () => {});
  return new Promise((resolve, reject) => {
    connection.query("SELECT DISTINCT session FROM auth", (err, results) => {
      connection.destroy();
      if (err) {
        // Table doesn't exist yet (fresh DB) — no sessions, return empty
        if ((err as any).code === "ER_NO_SUCH_TABLE") return resolve([]);
        return reject(err);
      }
      //@ts-ignore
      resolve(results.map((result) => result.session));
    });
  });
}

async function restoreSessions(): Promise<void> {
  try {
    const usernames = await getUsernames();
    for (const username of usernames) {
      if (!bailey[username]) {
        console.log("Restoring session for:", username);
        getOrCreateProvider(username);
      }
    }
  } catch (e) {
    console.error("Failed to restore sessions:", e);
  }
}

initDb();
restoreSessions();

/* ── WebSocket: QR delivery ─────────────────────────────────────────────── */

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type !== "set-username") return;
      const username = data.username;
      if (!isValidUsername(username)) return;
      getOrCreateProvider(username);
      addUserConnection(username, ws);
      if (qrs[username]) {
        ws.send(JSON.stringify({ type: "qr-code", message: qrs[username] }));
      }
      if (bailey[username]?.mysock) {
        ws.send(JSON.stringify({ type: "authenticated" }));
      }
    } catch (e) {
      console.error("WebSocket message error:", e);
    }
  });
  ws.on("close", () => removeConnection(ws));
});

/* ── Helpers ────────────────────────────────────────────────────────────── */

async function logMessage(
  username: string,
  phoneNumber: string,
  onWhatsapp: boolean,
  message: string
): Promise<void> {
  try {
    await insertMessage(username, phoneNumber, onWhatsapp, message);
  } catch (e) {
    console.error("Failed to log message to Postgres:", e);
  }
}

type BulkItemStatus = "sent" | "not_on_whatsapp" | "failed";

async function sendBulkItem(
  provider: BaileysProvider,
  job: BulkJob,
  rawNumber: unknown,
  content: AnyMessageContent,
  dbMessage: string
): Promise<{ status: BulkItemStatus; number: string }> {
  const number = normalizePhoneNumber(rawNumber);
  if (!number) {
    job.failed++;
    job.errors.push(`invalid number: ${String(rawNumber)}`);
    return { status: "failed", number: String(rawNumber) };
  }
  try {
    const on = await provider.mysock?.onWhatsApp(toJid(number));
    const isOnWhatsapp = !!(on && on.length > 0);
    if (isOnWhatsapp) {
      await provider.sendMessageWTyping(content, toJid(number));
      job.sent++;
    } else {
      job.notOnWhatsapp++;
    }
    await logMessage(job.username, toJid(number), isOnWhatsapp, dbMessage);
    return { status: isOnWhatsapp ? "sent" : "not_on_whatsapp", number };
  } catch (e) {
    job.failed++;
    job.errors.push(`${number}: ${String(e)}`);
    console.error(`Bulk send failed for ${number}:`, e);
    return { status: "failed", number };
  }
}

const delayBetween = async (index: number, total: number): Promise<void> => {
  if (index < total - 1) await delay(config.messageDelayMs);
};

const parseNumbers = (input: unknown): string[] => {
  const list = Array.isArray(input) ? input : String(input ?? "").split("\n");
  return list.map((n) => String(n).trim()).filter((n) => n.length > 0);
};

const checkusername = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const username = req.body?.username ?? req.query?.username;
  if (!isValidUsername(username)) {
    return res.status(400).send({ message: "Invalid or missing username" });
  }
  if (!bailey[username]) {
    return res.status(404).send({ message: "User not found" });
  }
  next();
};

const requireSock = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const username = req.body?.username ?? req.query?.username;
  if (!bailey[username]?.mysock) {
    return res
      .status(310)
      .json({ message: "WhatsApp connection not established." });
  }
  next();
};

/* ── Bulk send routes ───────────────────────────────────────────────────── */

app.post("/sendxlsx", checkusername, requireSock, async (req, res) => {
  const file = req.files?.file as fileUpload.UploadedFile | undefined;
  const messageColName: string = req.body.message;
  const colName: string = req.body.colname;
  const username: string = req.body.username;
  if (!file) return res.status(400).send({ message: "file is required" });
  if (!messageColName || !colName) {
    return res
      .status(400)
      .send({ message: "message and colname columns are required" });
  }

  let rows: Record<string, unknown>[];
  try {
    const xlsx = reader.read(file.data, { type: "buffer" });
    rows = reader.utils.sheet_to_json(xlsx.Sheets[xlsx.SheetNames[0]]);
  } catch (e) {
    return res.status(400).send({ message: "Could not parse the Excel file" });
  }

  const job = createJob("xlsx", username, rows.length);
  res.send({ status: "ok", jobId: job.id });

  const provider = bailey[username];
  const onWhatsapp: string[] = [];
  const notOnWhatsapp: string[] = [];
  try {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const text = String(row[messageColName] ?? "").trim();
      if (!row[colName] || !text) {
        job.failed++;
        job.errors.push(`row ${i + 2}: missing phone number or message`);
        continue;
      }
      const result = await sendBulkItem(
        provider,
        job,
        row[colName],
        { text },
        text
      );
      if (result.status === "sent") onWhatsapp.push(`+${result.number}`);
      if (result.status === "not_on_whatsapp")
        notOnWhatsapp.push(`+${result.number}`);
      await delayBetween(i, rows.length);
    }

    if (config.reportGroupId) {
      await provider.sendMessageWTyping(
        {
          text: `ارقام الهواتف الذين ليس لديهم واتس اب \n${[
            ...new Set(notOnWhatsapp),
          ].join("\n")}`,
        },
        config.reportGroupId
      );
      await provider.sendMessageWTyping(
        {
          text: `ارقام الهواتف الذين لديهم واتس اب \n${[
            ...new Set(onWhatsapp),
          ].join("\n")}`,
        },
        config.reportGroupId
      );
    }
  } catch (e) {
    console.error("sendxlsx job error:", e);
  } finally {
    finishJob(job);
  }
});

const bulkMediaRoute = (
  field: "video" | "image" | "file",
  buildContent: (f: fileUpload.UploadedFile, caption: string) => AnyMessageContent,
  dbLabel: string
) =>
  (async (req: express.Request, res: express.Response) => {
    const uploaded = req.files?.[field] as fileUpload.UploadedFile | undefined;
    const numbers = parseNumbers(req.body.phoneNumbers);
    const username: string = req.body.username;
    if (!uploaded) return res.status(400).send({ message: `${field} is required` });
    if (numbers.length === 0)
      return res.status(400).send({ message: "phoneNumbers is required" });

    const job = createJob(field, username, numbers.length);
    res.send({ status: "ok", jobId: job.id });

    const provider = bailey[username];
    const content = buildContent(uploaded, req.body.caption ?? "");
    try {
      for (let i = 0; i < numbers.length; i++) {
        await sendBulkItem(provider, job, numbers[i], content, dbLabel);
        await delayBetween(i, numbers.length);
      }
    } catch (e) {
      console.error(`${field} job error:`, e);
    } finally {
      finishJob(job);
    }
  }) as express.RequestHandler;

app.post(
  "/sendvideo",
  checkusername,
  requireSock,
  bulkMediaRoute(
    "video",
    (f, caption) => ({ video: f.data, caption, gifPlayback: false }),
    "Video"
  )
);
app.post(
  "/sendimage",
  checkusername,
  requireSock,
  bulkMediaRoute("image", (f, caption) => ({ image: f.data, caption }), "Photo")
);
app.post(
  "/sendfile",
  checkusername,
  requireSock,
  bulkMediaRoute(
    "file",
    (f) => ({ document: f.data, mimetype: f.mimetype, fileName: f.name }),
    "File"
  )
);

app.post("/bulk", checkusername, requireSock, async (req, res) => {
  const phoneMessage: string = req.body.message;
  const numbers = parseNumbers(req.body.numbers);
  const username: string = req.body.username;
  if (!phoneMessage)
    return res.status(400).send({ message: "message is required" });
  if (numbers.length === 0)
    return res.status(400).send({ message: "numbers is required" });

  const job = createJob("bulk", username, numbers.length);
  res.send({ status: "ok", jobId: job.id });

  const provider = bailey[username];
  try {
    for (let i = 0; i < numbers.length; i++) {
      await sendBulkItem(provider, job, numbers[i], { text: phoneMessage }, phoneMessage);
      await delayBetween(i, numbers.length);
    }
  } catch (e) {
    console.error("bulk job error:", e);
  } finally {
    finishJob(job);
  }
});

/* ── Job status ─────────────────────────────────────────────────────────── */

app.get("/jobs/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
});

app.get("/jobs", (req, res) => {
  const username = req.query.username as string | undefined;
  res.json(getJobs(username));
});

/* ── Single message routes ──────────────────────────────────────────────── */

app.post("/", checkusername, requireSock, async (req, res) => {
  const username: string = req.body.username;
  const { phoneNumber, message } = req.body;
  if (!phoneNumber || !message) {
    return res
      .status(400)
      .json({ message: "phoneNumber and message are required" });
  }
  try {
    const number = normalizePhoneNumber(phoneNumber, false);
    const on = await bailey[username].mysock!.onWhatsApp(toJid(number));
    if (on && on.length > 0) {
      console.log("Sending message to:", number);
      await bailey[username].sendMessageWTyping({ text: message }, toJid(number));
      await logMessage(username, toJid(number), true, message);
      res.status(200).json({ message: "Message sent." });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Internal server error.", error: String(err) });
  }
});

app.post("/id", checkusername, requireSock, async (req, res) => {
  const username: string = req.body.username;
  const ID = req.body.id;
  const message = req.body.message;
  if (!ID) return res.status(400).json({ message: "id is required." });
  if (!message) return res.status(400).json({ message: "message is required." });
  try {
    await bailey[username].mysock!.sendMessage(ID, { text: message });
    res.status(200).json({ message: "Message sent." });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Internal server error.", error: String(err) });
  }
});

/* ── Stats & sessions ───────────────────────────────────────────────────── */

app.post("/summery", async (req, res) => {
  const username = req.body?.username;
  if (!isValidUsername(username)) {
    return res.status(400).json({ message: "Invalid or missing username" });
  }
  try {
    res.send(await getSummary(username));
  } catch (err) {
    console.error("summery error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/usernames", async (req, res) => {
  try {
    res.send(await getUsernames());
  } catch (e) {
    console.error("usernames error:", e);
    res.status(500).json({ message: "Internal server error." });
  }
});

/* ── Groups ─────────────────────────────────────────────────────────────── */

app.get("/allgroups", checkusername, requireSock, async (req, res) => {
  const username = (req.query.username ?? req.body?.username) as string;
  try {
    const data = await bailey[username].mysock!.groupFetchAllParticipating();
    res.send({ data });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Internal server error.", error: String(err) });
  }
});

app.post("/getgroupid/:name", checkusername, requireSock, async (req, res) => {
  const username: string = req.body.username;
  try {
    const data = await bailey[username].mysock!.groupFetchAllParticipating();
    let id = "";
    for (const [key, value] of Object.entries(data)) {
      if (
        value.subject.trim().toLowerCase() ===
        req.params.name.trim().toLowerCase()
      ) {
        id = key;
      }
    }
    res.send({ id });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Internal server error.", error: String(err) });
  }
});

app.get("/getgroups/:username", async (req, res) => {
  const username = req.params.username;
  if (!bailey[username]) {
    return res.status(404).json({ message: "User not found." });
  }
  if (!bailey[username].mysock) {
    return res
      .status(310)
      .json({ message: "WhatsApp connection not established." });
  }
  try {
    const data = await bailey[username].mysock!.groupFetchAllParticipating();
    const groups: IGroup[] = [];
    for (const [key, value] of Object.entries(data)) {
      groups.push({ name: value.subject, id: key });
    }
    res.send(groups);
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Internal server error.", error: String(err) });
  }
});

app.post("/newgroup", checkusername, requireSock, async (req, res) => {
  const username: string = req.body.username;
  const groupName: string = req.body.name;
  const phoneNumbers: string[] = req.body.phoneNumbers;
  if (!groupName) return res.status(400).json({ message: "name is required." });
  if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
    return res.status(400).json({ message: "phoneNumbers is required." });
  }
  try {
    let isValid = true;
    const parsed = await Promise.all(
      phoneNumbers.map(async (phoneNumber) => {
        const jid = toJid(normalizePhoneNumber(phoneNumber, false));
        const on = await bailey[username].mysock!.onWhatsApp(jid);
        if (!(on && on.length > 0)) isValid = false;
        return jid;
      })
    );
    if (!isValid) {
      return res.status(404).json({ message: "One of Users not found." });
    }
    const group = await bailey[username].mysock!.groupCreate(groupName, parsed);
    res.status(200).json({ group });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Internal server error.", error: String(err) });
  }
});

app.post("/addgroupmembers", checkusername, requireSock, async (req, res) => {
  const username: string = req.body.username;
  const groupId: string = req.body.groupId;
  const phoneNumbers: string[] = req.body.phoneNumbers;
  if (!groupId) return res.status(400).json({ message: "groupId is required." });
  if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
    return res.status(400).json({ message: "phoneNumbers is required." });
  }
  try {
    const participants = phoneNumbers.map((num) =>
      toJid(normalizePhoneNumber(num, false))
    );
    await bailey[username].mysock!.groupParticipantsUpdate(
      groupId,
      participants,
      "add"
    );
    res.status(200).json({
      message: "Members added successfully",
      groupId,
      participants,
    });
  } catch (err) {
    console.error("Add group error:", err);
    res.status(500).json({ message: "Failed to add members", error: String(err) });
  }
});

app.post("/pfp", checkusername, requireSock, async (req, res) => {
  const username: string = req.body.username;
  const phoneNumber = req.body.phoneNumber;
  if (!phoneNumber) {
    return res.status(400).json({ message: "phoneNumber is required." });
  }
  try {
    const jid = toJid(normalizePhoneNumber(phoneNumber, false));
    const on = await bailey[username].mysock!.onWhatsApp(jid);
    if (!(on && on.length > 0)) {
      return res.status(404).json({ message: "User not found." });
    }
    let profilePictureUrl = "";
    try {
      profilePictureUrl =
        (await bailey[username].mysock!.profilePictureUrl(jid, "image")) ?? "";
    } catch (e) {
      profilePictureUrl = "";
    }
    res.status(200).json({ message: profilePictureUrl, on });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Internal server error.", error: String(err) });
  }
});

/* ── Static frontend ────────────────────────────────────────────────────── */

const dirname = path.resolve();
app.use(express.static(path.join(dirname, "frontend/dist")));
app.get("*", (req, res) =>
  res.sendFile(path.join(dirname, "frontend/dist/index.html"))
);

server.listen(config.port, () => {
  console.log("Server is running on port " + config.port);
});
