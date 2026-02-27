import makeWASocket, {
  Browsers,
  DisconnectReason,
  AnyMessageContent,
  delay,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from "baileys";
import reader from "xlsx";
import { createWriteStream } from "fs";
import pino from "pino";
import path from "path";
import qr, { image } from "qr-image";
import express from "express";
import { Boom } from "@hapi/boom";
import { rimraf } from "rimraf";
import { join } from "path";
import fileUpload from "express-fileupload";
import WebSocket from "ws";
import http from "http";
import QRCode from "qrcode";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./models/messageModel";
import handler from "serve-handler";
import fs from "fs";
import { useMySQLAuthState } from "mysql-baileys";
import mysql from "mysql2";

interface IGroup {
  id: string;
  name: string;
}

const mysqlConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  database: process.env.MYSQL_DATABASE || "whatsapp",
};

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const userConnections: Record<string, { ws: WebSocket }> = {};
dotenv.config();
const bailey: Record<string, BaileysProvider> = {};

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log("Connected to MongoDB");
    const usernames = await getUsernames();
    for (const username of usernames) {
      if (!bailey.hasOwnProperty(username)) {
        console.log("Creating new instance for: ", username);
        bailey[username] = new BaileysProvider(username);
      }
    }
  })
  .catch((error) => console.log(error.message));

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    //@ts-ignore
    const data = JSON.parse(message);
    if (data.type === "set-username") {
      const username = data.username;
      if (!bailey.hasOwnProperty(username)) {
        if (!username) return;
        bailey[username] = new BaileysProvider(username);
      }
      userConnections[username] = { ws };
      if (qrs[username]) {
        ws.send(
          JSON.stringify({
            type: "qr-code",
            message: qrs[username],
          })
        );
      }
      if (bailey[username]?.mysock) {
        ws.send(
          JSON.stringify({
            type: "authenticated",
          })
        );
      }
    }
  });

  ws.on("close", () => {
    for (const username in userConnections) {
      if (userConnections[username].ws === ws) {
        delete userConnections[username];
        break;
      }
    }
  });
});
const PORT = process.env.PORT || 3000;
const qrs: Record<string, string> = {};
const baileyGenerateImage = async (base64: string, name = "qr.png") => {
  const username = name.replace(".qr.png", "");
  QRCode.toDataURL(base64).then((url) => {
    qrs[username] = url;
  });
  if (userConnections[username]) {
    QRCode.toDataURL(base64).then((url) => {
      userConnections[username].ws.send(
        JSON.stringify({
          type: "qr-code",
          message: url,
        })
      );
    });
  }
  const PATH_QR = `${process.cwd()}/${name}`;
  let qr_svg = qr.image(base64, { type: "png", margin: 4 });

  const writeFilePromise = () =>
    new Promise((resolve, reject) => {
      const file = qr_svg.pipe(createWriteStream(PATH_QR));
      file.on("finish", () => resolve(true));
      file.on("error", reject);
    });

  await writeFilePromise();
};
class BaileysProvider {
  name: string;
  qrRetry: number;
  saveCredsGlobal: undefined | (() => Promise<void>);
  mysock: ReturnType<typeof makeWASocket> | undefined;
  sendMessageWTyping: (msg: AnyMessageContent, jid: string) => Promise<void>;
  constructor(name: string) {
    this.name = name;
    this.qrRetry = 0;
    this.mysock = undefined;
    this.saveCredsGlobal = undefined;
    this.sendMessageWTyping = async (msg: AnyMessageContent, jid: string) => {
      await this.mysock!.presenceSubscribe(jid);
      await delay(500);

      await this.mysock!.sendPresenceUpdate("composing", jid);
      await delay(2000);

      await this.mysock!.sendPresenceUpdate("paused", jid);

      await this.mysock!.sendMessage(jid, msg);
      await delay(2000);
    };
    this.initBailey().then();
  }
  initBailey = async () => {
    const NAME_DIR_SESSION = `${this.name}_sessions`;
    // const { state, saveCreds } = await useMultiFileAuthState(NAME_DIR_SESSION);
    const { state, saveCreds, removeCreds } = await useMySQLAuthState({
      ...mysqlConfig,
      session: this.name,
    });
    this.saveCredsGlobal = saveCreds;
    try {
      const { version } = await fetchLatestBaileysVersion();
      const sock = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: state,
        markOnlineOnConnect: false,
        syncFullHistory: false,
        //@ts-ignore
        logger: pino({ level: "fatal" }),
      });

      sock.ev.on("presence.update", async (upsert) => {
        console.log("presence.update", upsert);
      });

      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        if (connection === "close") {
          if (statusCode !== DisconnectReason.loggedOut) {
            this.initBailey();
          }
          if (statusCode === DisconnectReason.loggedOut) {
            const PATH_BASE = join(process.cwd(), NAME_DIR_SESSION);
            rimraf(PATH_BASE);
            this.initBailey();
          }
        }
        if (connection === "open") {
          console.log(`${this.name} is : ready`);
          // sock.presenceSubscribe("218910441322@s.whatsapp.net");
          userConnections[this.name as string]?.ws.send(
            JSON.stringify({
              type: "authenticated",
            })
          );
          this.initBusEvents(sock);
        }
        /** QR Code */
        if (qr) {
          this.qrRetry++;
          if (this.qrRetry >= 3) {
            qrs[this.name as string] = "";
            console.log("socket connection terminated");
            userConnections[this.name as string].ws.send(
              JSON.stringify({
                type: "qr-code",
                message: "Bye",
              })
            );
            delete userConnections[this.name as string];
            delete bailey[this.name as string];
            return;
          } else {
            await baileyGenerateImage(qr, `${this.name}.qr.png`);
          }
        }
      });
      sock.ev.on("creds.update", async () => {
        await saveCreds();
      });
    } catch (e) {
      console.log(e);
    }
  };
  initBusEvents = (_sock: ReturnType<typeof makeWASocket>) => {
    this.mysock = _sock;
  };
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
const checkusername = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (bailey.hasOwnProperty(req.body.username)) {
    next();
  } else {
    res.status(404).send({ message: "User not found" });
  }
};

app.post("/sendxlsx", checkusername, async (req, res) => {
  let file = req.files!.file as fileUpload.UploadedFile;
  const messageColName: string = req.body.message;
  const username: string = req.body.username;
  const colName = req.body.colname;
  let ext = path.extname(file.name);
  let filename = Date.now() + ext;
  let uploadPath = "./backend/files/" + filename;
  file.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);
  });
  const xlsx = reader.read(file.data, { type: "buffer" });
  const temps = reader.utils.sheet_to_json(
    xlsx.Sheets[xlsx.SheetNames[0]]
  ) as any[];
  const conclusion = [];
  for (const temp of temps) {
    const number = temp[colName].toString();
    const phoneMessage = temp[messageColName];
    let filterNumber = number.replace(/\D/g, "");
    console.log(filterNumber);
    if (filterNumber.startsWith("20")) {
    } else if (filterNumber.startsWith("0")) {
      filterNumber = "20" + filterNumber.substring(1);
    } else {
      filterNumber = "20" + filterNumber;
    }
    try {
      const on = await bailey[username]?.mysock?.onWhatsApp(
        `${filterNumber}@s.whatsapp.net`
      )!;
      const isOnWhatsapp = on && on.length > 0 ? true : false;
      conclusion.push({
        username,
        phoneNumber: `+${filterNumber}`,
        onWhatsapp: isOnWhatsapp,
        message: phoneMessage,
      });
      const MessageDatabase = new Message({
        username,
        phoneNumber: `${filterNumber}@s.whatsapp.net`,
        onWhatsapp: isOnWhatsapp,
        message: phoneMessage,
      });

      if (isOnWhatsapp) {
        await bailey[username].sendMessageWTyping(
          { text: phoneMessage },
          `${filterNumber}@s.whatsapp.net`
        );
      } else {
        //send message to the group
        await bailey[username].sendMessageWTyping(
          { text: `رقم الهاتف ${number} لا يوجد عليه تطبيق واتس اب` },
          "120363415834329316@g.us"
        );
        console.log("User not found: ", filterNumber);
      }
      await MessageDatabase.save();
    } catch (e) {
      await bailey[username].sendMessageWTyping(
        { text: `رقم الهاتف ${number} لا يوجد عليه تطبيق واتس اب` },
        "120363415834329316@g.us"
      );
      console.log("User Faild: ", filterNumber);
    }
  }

  await bailey[username].sendMessageWTyping(
    {
      text: `ارقام الهواتف الذين ليس لديهم واتس اب \n ${Array.from(
        new Set(
          conclusion
            .filter((item) => item.onWhatsapp === false)
            .map((item) => item.phoneNumber)
        )
      ).join("\n")}`,
    },
    "120363415834329316@g.us"
  );
  await bailey[username].sendMessageWTyping(
    {
      text: `ارقام الهواتف الذين لديهم واتس اب \n ${Array.from(
        new Set(
          conclusion
            .filter((item) => item.onWhatsapp === true)
            .map((item) => item.phoneNumber)
        )
      ).join("\n")}`,
    },
    "120363415834329316@g.us"
  );
  fs.unlinkSync(uploadPath);
  res.send("ok");
});

app.post("/", checkusername, async (req, res) => {
  const username = req.body.username;
  if (!bailey[username].mysock) {
    console.log("WhatsApp connection not established.");
    return res
      .status(310)
      .json({ message: "WhatsApp connection not established." });
  }
  try {
    let phoneNumber = req.body.phoneNumber || "201023243977";
    const message = req.body.message || "hi";
    phoneNumber = phoneNumber
      .replaceAll("+", "")
      .replaceAll("-", "")
      .replaceAll(" ", "")
      .replaceAll("(", "")
      .replaceAll(")", "");
    if (phoneNumber[2] === "0") {
      phoneNumber = phoneNumber.slice(0, 2) + phoneNumber.slice(3);
    }
    const on = await bailey[username]?.mysock?.onWhatsApp(phoneNumber);
    if (!on) {
      res.status(404).json({ message: "User not found." });
      return;
    }
    if (on.length > 0) {
      console.log("Sending message to: ", phoneNumber);
      await bailey[username]?.sendMessageWTyping(
        {
          text: message,
        },
        `${phoneNumber}@s.whatsapp.net`
      );
      res.status(200).json({ message: "Message sent." });
    } else {
      console.log("User not found: ", phoneNumber);
      res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    console.log("Error: ", err);
    res
      .status(500)
      .json({ message: "Internel server error.", error: String(err) });
  }
});
app.post("/sendvideo", checkusername, async (req, res) => {
  const video = req.files!.video as fileUpload.UploadedFile;
  const numbers: string = req.body.phoneNumbers;
  const caption: string | null = req.body.caption;
  const username = req.body.username;
  const numbersArray: string[] = numbers.split("\n");
  for (const number of numbersArray) {
    const raw = number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").replace(/\s/g, "");
    const filterNumber = raw.startsWith("20") ? raw : raw.startsWith("0") ? "20" + raw.substring(1) : "20" + raw;
    const on = await bailey[username]?.mysock?.onWhatsApp(filterNumber)!;
    const isOnWhatsapp = on && on.length > 0 ? true : false;
    const MessageDatabase = new Message({
      username,
      phoneNumber: `${filterNumber}@s.whatsapp.net`,
      onWhatsapp: isOnWhatsapp,
      message: "Video",
    });
    if (isOnWhatsapp) {
      await bailey[username].sendMessageWTyping(
        {
          video: video.data,
          caption: caption ?? "",
          gifPlayback: false,
        },
        `${filterNumber}@s.whatsapp.net`
      );
    }
    await MessageDatabase.save();
  }
  res.send("ok");
});
app.post("/sendimage", checkusername, async (req, res) => {
  const image = req.files!.image as fileUpload.UploadedFile;
  const numbers: string = req.body.phoneNumbers;
  const caption: string | null = req.body.caption;
  const username = req.body.username;
  const numbersArray: string[] = numbers.split("\n");
  for (const number of numbersArray) {
    const raw = number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").replace(/\s/g, "");
    const filterNumber = raw.startsWith("20") ? raw : raw.startsWith("0") ? "20" + raw.substring(1) : "20" + raw;
    console.log(filterNumber);
    const on = await bailey[username]?.mysock?.onWhatsApp(filterNumber)!;
    const isOnWhatsapp = on && on.length > 0 ? true : false;
    const MessageDatabase = new Message({
      username,
      phoneNumber: `${filterNumber}@s.whatsapp.net`,
      onWhatsapp: isOnWhatsapp,
      message: "Photo",
    });
    if (isOnWhatsapp) {
      await bailey[username].sendMessageWTyping(
        {
          image: image.data,
          caption: caption ?? "",
        },
        `${filterNumber}@s.whatsapp.net`
      );
    }
    await MessageDatabase.save();
  }
  res.send("ok");
});
app.post("/sendfile", checkusername, async (req, res) => {
  const file = req.files!.file as fileUpload.UploadedFile;
  const numbers: string = req.body.phoneNumbers;
  const username = req.body.username;
  const numbersArray: string[] = numbers.split("\n");
  for (const number of numbersArray) {
    const raw = number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").replace(/\s/g, "");
    const filterNumber = raw.startsWith("20") ? raw : raw.startsWith("0") ? "20" + raw.substring(1) : "20" + raw;
    const on = await bailey[username]?.mysock?.onWhatsApp(filterNumber)!;
    const isOnWhatsapp = on && on.length > 0 ? true : false;
    const MessageDatabase = new Message({
      username,
      phoneNumber: `${filterNumber}@s.whatsapp.net`,
      onWhatsapp: isOnWhatsapp,
      message: "File",
    });
    if (isOnWhatsapp) {
      await bailey[username].sendMessageWTyping(
        {
          document: file.data,
          mimetype: file.mimetype,
          fileName: file.name,
        },
        `${filterNumber}@s.whatsapp.net`
      );
    }
    await MessageDatabase.save();
  }
  res.send("ok");
});
app.post("/bulk", checkusername, async (req, res) => {
  const phoneMessage: string = req.body.message;
  const numbersArray: string = req.body.numbers;
  const username: string = req.body.username;
  for (const number of numbersArray) {
    const raw = number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").replace(/\s/g, "");
    const filterNumber = raw.startsWith("20") ? raw : raw.startsWith("0") ? "20" + raw.substring(1) : "20" + raw;
    const on = await bailey[username]?.mysock?.onWhatsApp(filterNumber)!;
    const isOnWhatsapp = on && on.length > 0 ? true : false;
    const MessageDatabase = new Message({
      username,
      phoneNumber: `${filterNumber}@s.whatsapp.net`,
      onWhatsapp: isOnWhatsapp,
      message: phoneMessage,
    });
    if (isOnWhatsapp) {
      await bailey[username].sendMessageWTyping(
        { text: phoneMessage },
        `${filterNumber}@s.whatsapp.net`
      );
    }
    await MessageDatabase.save();
  }
  res.send("ok");
});
app.post("/summery", async (req, res) => {
  const username: string = req.body.username;
  const totalMessages = await Message.countDocuments({ username });
  const uniqueWhatsAppUsers = await Message.distinct("phoneNumber", {
    username,
    onWhatsapp: true,
  });
  const totalUsersUniqueWhatsAppUsers = uniqueWhatsAppUsers.length;
  const uniqueNonWhatsAppUsers = await Message.distinct("phoneNumber", {
    username,
    onWhatsapp: false,
  });
  const totalUsersUniqueNonWhatsAppUsers = uniqueNonWhatsAppUsers.length;
  return res.send({
    totalMessages,
    totalUsersUniqueWhatsAppUsers,
    totalUsersUniqueNonWhatsAppUsers,
  });
});
function getUsernames(): Promise<string[]> {
  const connection = mysql.createConnection(mysqlConfig);
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT DISTINCT session FROM auth",
      (err, results, fields) => {
        connection.end();
        if (err) {
          // Table doesn't exist yet (fresh DB) — no sessions, return empty
          if ((err as any).code === "ER_NO_SUCH_TABLE") return resolve([]);
          return reject(err);
        }
        //@ts-ignore
        resolve(results.map((result) => result.session));
      }
    );
  });
}
app.get("/usernames", async (req, res) => {
  res.send(await getUsernames());
});

app.get("/allgroups", checkusername, async (req, res) => {
  const username = req.body.username;
  if (!bailey[username].mysock) {
    console.log("WhatsApp connection not established.");
    return res
      .status(310)
      .json({ message: "WhatsApp connection not established." });
  }
  try {
    const data = await bailey[username].mysock?.groupFetchAllParticipating();
    res.send({ data });
  } catch (err) {
    console.log("Error: ", err);
    res
      .status(500)
      .json({ message: "Internel server error.", error: String(err) });
  }
});
app.post("/getgroupid/:name", checkusername, async (req, res) => {
  const username = req.body.username;
  if (!bailey[username].mysock) {
    console.log("WhatsApp connection not established.");
    return res
      .status(310)
      .json({ message: "WhatsApp connection not established." });
  }
  try {
    const data = await bailey[username].mysock?.groupFetchAllParticipating();
    if (!data) {
      res.send({ message: "No groups found." });
      return;
    }
    let id = "";
    for (const [key, value] of Object.entries(data)) {
      if (
        value.subject.trim().toLowerCase() ==
        req.params.name.trim().toLowerCase()
      ) {
        console.log(key);
        id = key;
      }
    }
    res.send({ id });
  } catch (err) {
    console.log("Error: ", err);
    res
      .status(500)
      .json({ message: "Internel server error.", error: String(err) });
  }
});
app.get("/getgroups/:username", async (req, res) => {
  const username = req.params.username;
  if (bailey.hasOwnProperty(username)) {
    if (!bailey[username].mysock) {
      console.log("WhatsApp connection not established.");
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
      console.log("Error: ", err);
      res
        .status(500)
        .json({ message: "Internel server error.", error: String(err) });
    }
  } else {
    res.status(404).json({ message: "User not found." });
  }
});
app.post("/newgroup", checkusername, async (req, res) => {
  const username = req.body.username;
  if (!bailey[username].mysock) {
    console.log("WhatsApp connection not established.");
    return res
      .status(310)
      .json({ message: "WhatsApp connection not established." });
  }
  try {
    const groupName: string = req.body.name || "My test Group";
    const phoneNumbers: string[] = req.body.phoneNumbers || ["201000000000"];
    let isValid = true;
    const phoneNumersParsed = await Promise.all(
      phoneNumbers.map(async (phoneNumber) => {
        const ph =
          phoneNumber.replace("+", "").replace("-", "").replace(" ", "") +
          "@s.whatsapp.net";
        const on = await bailey[username].mysock!.onWhatsApp(ph);
        if (!(on && on.length > 0)) {
          isValid = false;
        }
        return ph;
      })
    );

    if (isValid) {
      const group = await bailey[username].mysock!.groupCreate(
        groupName,
        phoneNumersParsed
      );
      res.status(200).json({ group });
    } else {
      res.status(404).json({ message: "One of Users not found." });
    }
  } catch (err) {
    console.log("Error: ", err);
    res
      .status(500)
      .json({ message: "Internel server error.", error: String(err) });
  }
});
app.post("/id", checkusername, async (req, res) => {
  const username = req.body.username;
  const ID = req.body.id;
  const message = req.body.message || "hi";
  if (!bailey[username].mysock) {
    console.log("WhatsApp connection not established.");
    return res
      .status(310)
      .json({ message: "WhatsApp connection not established." });
  }
  try {
    if (!ID) {
      res.status(400).json({ message: "id is required." });
      return;
    }
    await bailey[username].mysock!.sendMessage(ID, {
      text: message,
    });
    res.status(200).json({ message: "Message sent." });
  } catch (err) {
    console.log("Error: ", err);
    res
      .status(500)
      .json({ message: "Internel server error.", error: String(err) });
  }
});

app.post("/addgroupmembers", checkusername, async (req, res) => {
  const username = req.body.username;
  const groupId = req.body.groupId;
  const phoneNumbers: string[] = req.body.phoneNumbers;

  if (!bailey[username]?.mysock) {
    return res.status(310).json({
      message: "WhatsApp connection not established.",
    });
  }

  try {
    const participants = phoneNumbers.map((num) => {
      return num.replace(/\D/g, "") + "@c.us";
    });

    await bailey[username].mysock.groupParticipantsUpdate(
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
    console.log("Add group error:", err);
    res.status(500).json({
      message: "Failed to add members",
      error: String(err),
    });
  }
});

app.post("/pfp", checkusername, async (req, res) => {
  const username = req.body.username;
  const phoneNumber = req.body.phoneNumber;
  if (!bailey[username].mysock) {
    console.log("WhatsApp connection not established.");
    return res
      .status(310)
      .json({ message: "WhatsApp connection not established." });
  }
  try {
    if (!phoneNumber) {
      res.status(400).json({ message: "phoneNumber is required." });
      return;
    }
    const ID = `${phoneNumber}@s.whatsapp.net`;
    const on = await bailey[username].mysock!.onWhatsApp(ID);
    if (!(on && on.length > 0)) {
      res.status(404).json({ message: "User not found." });
      return;
    }
    let profilePictureUrl;
    try {
      profilePictureUrl = await bailey[username].mysock!.profilePictureUrl(
        ID,
        "image"
      );
    } catch (e) {
      profilePictureUrl = "";
    }
    res.status(200).json({
      message: profilePictureUrl,
      on,
    });
  } catch (err) {
    console.log("Error: ", err);
    res
      .status(500)
      .json({ message: "Internel server error.", error: String(err) });
  }
});

const dirname = path.resolve();
app.get("/backend/files*", (req, res) => {
  return handler(req, res, {
    cleanUrls: false,
  });
});
app.get("*_sessions*", (req, res) => {
  return handler(req, res, {
    cleanUrls: false,
  });
});
app.get("/melkmeshiqr", (req, res) =>
  res.sendFile(path.join(dirname, "/melkmeshi.qr.png"))
);

app.use(express.static(path.join(dirname, "/frontend/dist")));
app.get("*", (req, res) =>
  res.sendFile(path.join(dirname, "/frontend/dist/index.html"))
);

server.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
