"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("baileys"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = require("fs");
const pino_1 = __importDefault(require("pino"));
const path_1 = __importDefault(require("path"));
const qr_image_1 = __importDefault(require("qr-image"));
const express_1 = __importDefault(require("express"));
const rimraf_1 = require("rimraf");
const path_2 = require("path");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const ws_1 = __importDefault(require("ws"));
const http_1 = __importDefault(require("http"));
const qrcode_1 = __importDefault(require("qrcode"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const messageModel_1 = __importDefault(require("./models/messageModel"));
const serve_handler_1 = __importDefault(require("serve-handler"));
const fs_2 = __importDefault(require("fs"));
const mysql_baileys_1 = require("mysql-baileys");
const mysql2_1 = __importDefault(require("mysql2"));
const mysqlConfig = {
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    database: process.env.MYSQL_DATABASE || "whatsapp",
};
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
const wss = new ws_1.default.Server({ server });
const userConnections = {};
dotenv_1.default.config();
const bailey = {};
mongoose_1.default
    .connect(process.env.MONGODB_URI)
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
                if (!username)
                    return;
                bailey[username] = new BaileysProvider(username);
            }
            userConnections[username] = { ws };
            if (qrs[username]) {
                ws.send(JSON.stringify({
                    type: "qr-code",
                    message: qrs[username],
                }));
            }
            if (bailey[username]?.mysock) {
                ws.send(JSON.stringify({
                    type: "authenticated",
                }));
            }
            else if (bailey[username] && !bailey[username].mysock) {
                // Connection is still initializing — wait for it and notify when ready
                const checkInterval = setInterval(() => {
                    if (bailey[username]?.mysock) {
                        clearInterval(checkInterval);
                        if (userConnections[username]?.ws.readyState === ws_1.default.OPEN) {
                            userConnections[username].ws.send(JSON.stringify({
                                type: "authenticated",
                            }));
                        }
                    }
                }, 1000);
                // Stop checking after 30 seconds to avoid leaks
                setTimeout(() => clearInterval(checkInterval), 30000);
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
const PORT = process.env.PORT || 4000;
const qrs = {};
const baileyGenerateImage = async (base64, name = "qr.png") => {
    const username = name.replace(".qr.png", "");
    qrcode_1.default.toDataURL(base64).then((url) => {
        qrs[username] = url;
    });
    if (userConnections[username]) {
        qrcode_1.default.toDataURL(base64).then((url) => {
            userConnections[username].ws.send(JSON.stringify({
                type: "qr-code",
                message: url,
            }));
        });
    }
    const PATH_QR = `${process.cwd()}/${name}`;
    let qr_svg = qr_image_1.default.image(base64, { type: "png", margin: 4 });
    const writeFilePromise = () => new Promise((resolve, reject) => {
        const file = qr_svg.pipe((0, fs_1.createWriteStream)(PATH_QR));
        file.on("finish", () => resolve(true));
        file.on("error", reject);
    });
    await writeFilePromise();
};
class BaileysProvider {
    constructor(name) {
        this.initBailey = async () => {
            const NAME_DIR_SESSION = `${this.name}_sessions`;
            // const { state, saveCreds } = await useMultiFileAuthState(NAME_DIR_SESSION);
            const { state, saveCreds, removeCreds } = await (0, mysql_baileys_1.useMySQLAuthState)({
                ...mysqlConfig,
                session: this.name,
            });
            this.saveCredsGlobal = saveCreds;
            try {
                const { version } = await (0, baileys_1.fetchLatestBaileysVersion)();
                const sock = (0, baileys_1.default)({
                    version,
                    printQRInTerminal: false,
                    auth: state,
                    markOnlineOnConnect: false,
                    syncFullHistory: false,
                    //@ts-ignore
                    logger: (0, pino_1.default)({ level: "fatal" }),
                });
                sock.ev.on("presence.update", async (upsert) => {
                    console.log("presence.update", upsert);
                });
                sock.ev.on("connection.update", async (update) => {
                    const { connection, lastDisconnect, qr } = update;
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    if (connection === "close") {
                        if (statusCode !== baileys_1.DisconnectReason.loggedOut) {
                            this.initBailey();
                        }
                        if (statusCode === baileys_1.DisconnectReason.loggedOut) {
                            const PATH_BASE = (0, path_2.join)(process.cwd(), NAME_DIR_SESSION);
                            (0, rimraf_1.rimraf)(PATH_BASE);
                            this.initBailey();
                        }
                    }
                    if (connection === "open") {
                        console.log(`${this.name} is : ready`);
                        // sock.presenceSubscribe("218910441322@s.whatsapp.net");
                        userConnections[this.name]?.ws.send(JSON.stringify({
                            type: "authenticated",
                        }));
                        this.initBusEvents(sock);
                    }
                    /** QR Code */
                    if (qr) {
                        this.qrRetry++;
                        if (this.qrRetry >= 3) {
                            qrs[this.name] = "";
                            console.log("socket connection terminated");
                            userConnections[this.name]?.ws.send(JSON.stringify({
                                type: "qr-code",
                                message: "Bye",
                            }));
                            delete userConnections[this.name];
                            delete bailey[this.name];
                            return;
                        }
                        else {
                            await baileyGenerateImage(qr, `${this.name}.qr.png`);
                        }
                    }
                });
                sock.ev.on("creds.update", async () => {
                    await saveCreds();
                });
            }
            catch (e) {
                console.log(e);
            }
        };
        this.initBusEvents = (_sock) => {
            this.mysock = _sock;
        };
        this.name = name;
        this.qrRetry = 0;
        this.mysock = undefined;
        this.saveCredsGlobal = undefined;
        this.sendMessageWTyping = async (msg, jid) => {
            await this.mysock.presenceSubscribe(jid);
            await (0, baileys_1.delay)(500);
            await this.mysock.sendPresenceUpdate("composing", jid);
            await (0, baileys_1.delay)(2000);
            await this.mysock.sendPresenceUpdate("paused", jid);
            await this.mysock.sendMessage(jid, msg);
            await (0, baileys_1.delay)(1000);
        };
        this.initBailey().then();
    }
}
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_fileupload_1.default)());
const checkusername = (req, res, next) => {
    if (bailey.hasOwnProperty(req.body.username)) {
        next();
    }
    else {
        res.status(404).send({ message: "User not found" });
    }
};
app.post("/sendxlsx", checkusername, async (req, res) => {
    let file = req.files.file;
    const messageColName = req.body.message;
    const username = req.body.username;
    const colName = req.body.colname;
    let ext = path_1.default.extname(file.name);
    let filename = Date.now() + ext;
    let uploadPath = "./backend/files/" + filename;
    file.mv(uploadPath, function (err) {
        if (err)
            return res.status(500).send(err);
    });
    const xlsx = xlsx_1.default.read(file.data, { type: "buffer" });
    const temps = xlsx_1.default.utils.sheet_to_json(xlsx.Sheets[xlsx.SheetNames[0]]);
    res.send("ok");
    const conclusion = [];
    for (const temp of temps) {
        const number = temp[colName].toString();
        const phoneMessage = temp[messageColName];
        let filterNumber = number.replace(/\D/g, "");
        console.log(filterNumber);
        if (filterNumber.startsWith("20")) {
        }
        else if (filterNumber.startsWith("0")) {
            filterNumber = "20" + filterNumber.substring(1);
        }
        else {
            filterNumber = "20" + filterNumber;
        }
        try {
            const on = await bailey[username]?.mysock?.onWhatsApp(`${filterNumber}@s.whatsapp.net`);
            const isOnWhatsapp = on && on.length > 0 ? true : false;
            conclusion.push({
                username,
                phoneNumber: `+${filterNumber}`,
                onWhatsapp: isOnWhatsapp,
                message: phoneMessage,
            });
            const MessageDatabase = new messageModel_1.default({
                username,
                phoneNumber: `${filterNumber}@s.whatsapp.net`,
                onWhatsapp: isOnWhatsapp,
                message: phoneMessage,
            });
            if (isOnWhatsapp) {
                await bailey[username].sendMessageWTyping({ text: phoneMessage }, `${filterNumber}@s.whatsapp.net`);
            }
            else {
                //send message to the group
                await bailey[username].sendMessageWTyping({ text: `رقم الهاتف ${number} لا يوجد عليه تطبيق واتس اب` }, "120363415834329316@g.us");
                console.log("User not found: ", filterNumber);
            }
            await MessageDatabase.save();
        }
        catch (e) {
            await bailey[username].sendMessageWTyping({ text: `رقم الهاتف ${number} لا يوجد عليه تطبيق واتس اب` }, "120363415834329316@g.us");
            console.log("User Faild: ", filterNumber);
        }
    }
    await bailey[username].sendMessageWTyping({
        text: `ارقام الهواتف الذين ليس لديهم واتس اب \n ${Array.from(new Set(conclusion
            .filter((item) => item.onWhatsapp === false)
            .map((item) => item.phoneNumber))).join("\n")}`,
    }, "120363415834329316@g.us");
    await bailey[username].sendMessageWTyping({
        text: `ارقام الهواتف الذين لديهم واتس اب \n ${Array.from(new Set(conclusion
            .filter((item) => item.onWhatsapp === true)
            .map((item) => item.phoneNumber))).join("\n")}`,
    }, "120363415834329316@g.us");
    fs_2.default.unlinkSync(uploadPath);
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
            await bailey[username]?.sendMessageWTyping({
                text: message,
            }, `${phoneNumber}@s.whatsapp.net`);
            res.status(200).json({ message: "Message sent." });
        }
        else {
            console.log("User not found: ", phoneNumber);
            res.status(404).json({ message: "User not found." });
        }
    }
    catch (err) {
        console.log("Error: ", err);
        res
            .status(500)
            .json({ message: "Internel server error.", error: String(err) });
    }
});
app.post("/sendvideo", checkusername, async (req, res) => {
    const video = req.files.video;
    const numbers = req.body.phoneNumbers;
    const caption = req.body.caption;
    const username = req.body.username;
    const numbersArray = numbers.split("\n");
    res.send("ok");
    for (const number of numbersArray) {
        const raw = number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").replace(/\s/g, "");
        const filterNumber = raw.startsWith("20") ? raw : raw.startsWith("0") ? "20" + raw.substring(1) : "20" + raw;
        const on = await bailey[username]?.mysock?.onWhatsApp(filterNumber);
        const isOnWhatsapp = on && on.length > 0 ? true : false;
        const MessageDatabase = new messageModel_1.default({
            username,
            phoneNumber: `${filterNumber}@s.whatsapp.net`,
            onWhatsapp: isOnWhatsapp,
            message: "Video",
        });
        if (isOnWhatsapp) {
            await bailey[username].sendMessageWTyping({
                video: video.data,
                caption: caption ?? "",
                gifPlayback: false,
            }, `${filterNumber}@s.whatsapp.net`);
        }
        await MessageDatabase.save();
    }
});
app.post("/sendimage", checkusername, async (req, res) => {
    const image = req.files.image;
    const numbers = req.body.phoneNumbers;
    const caption = req.body.caption;
    const username = req.body.username;
    const numbersArray = numbers.split("\n");
    res.send("ok");
    for (const number of numbersArray) {
        const raw = number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").replace(/\s/g, "");
        const filterNumber = raw.startsWith("20") ? raw : raw.startsWith("0") ? "20" + raw.substring(1) : "20" + raw;
        console.log(filterNumber);
        const on = await bailey[username]?.mysock?.onWhatsApp(filterNumber);
        const isOnWhatsapp = on && on.length > 0 ? true : false;
        const MessageDatabase = new messageModel_1.default({
            username,
            phoneNumber: `${filterNumber}@s.whatsapp.net`,
            onWhatsapp: isOnWhatsapp,
            message: "Photo",
        });
        if (isOnWhatsapp) {
            await bailey[username].sendMessageWTyping({
                image: image.data,
                caption: caption ?? "",
            }, `${filterNumber}@s.whatsapp.net`);
        }
        await MessageDatabase.save();
    }
});
app.post("/sendfile", checkusername, async (req, res) => {
    const file = req.files.file;
    const numbers = req.body.phoneNumbers;
    const username = req.body.username;
    const numbersArray = numbers.split("\n");
    res.send("ok");
    for (const number of numbersArray) {
        const raw = number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").replace(/\s/g, "");
        const filterNumber = raw.startsWith("20") ? raw : raw.startsWith("0") ? "20" + raw.substring(1) : "20" + raw;
        const on = await bailey[username]?.mysock?.onWhatsApp(filterNumber);
        const isOnWhatsapp = on && on.length > 0 ? true : false;
        const MessageDatabase = new messageModel_1.default({
            username,
            phoneNumber: `${filterNumber}@s.whatsapp.net`,
            onWhatsapp: isOnWhatsapp,
            message: "File",
        });
        if (isOnWhatsapp) {
            await bailey[username].sendMessageWTyping({
                document: file.data,
                mimetype: file.mimetype,
                fileName: file.name,
            }, `${filterNumber}@s.whatsapp.net`);
        }
        await MessageDatabase.save();
    }
});
app.post("/bulk", checkusername, async (req, res) => {
    const phoneMessage = req.body.message;
    const numbersArray = req.body.numbers;
    const username = req.body.username;
    res.send("ok");
    for (const number of numbersArray) {
        const raw = number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").replace(/\s/g, "");
        const filterNumber = raw.startsWith("20") ? raw : raw.startsWith("0") ? "20" + raw.substring(1) : "20" + raw;
        const on = await bailey[username]?.mysock?.onWhatsApp(filterNumber);
        const isOnWhatsapp = on && on.length > 0 ? true : false;
        const MessageDatabase = new messageModel_1.default({
            username,
            phoneNumber: `${filterNumber}@s.whatsapp.net`,
            onWhatsapp: isOnWhatsapp,
            message: phoneMessage,
        });
        if (isOnWhatsapp) {
            await bailey[username].sendMessageWTyping({ text: phoneMessage }, `${filterNumber}@s.whatsapp.net`);
        }
        await MessageDatabase.save();
    }
});
app.post("/summery", async (req, res) => {
    try {
        const username = req.body.username;
        const totalMessages = await messageModel_1.default.countDocuments({ username });
        const uniqueWhatsAppUsers = await messageModel_1.default.distinct("phoneNumber", {
            username,
            onWhatsapp: true,
        });
        const totalUsersUniqueWhatsAppUsers = uniqueWhatsAppUsers.length;
        const uniqueNonWhatsAppUsers = await messageModel_1.default.distinct("phoneNumber", {
            username,
            onWhatsapp: false,
        });
        const totalUsersUniqueNonWhatsAppUsers = uniqueNonWhatsAppUsers.length;
        return res.send({
            totalMessages,
            totalUsersUniqueWhatsAppUsers,
            totalUsersUniqueNonWhatsAppUsers,
        });
    }
    catch (err) {
        console.log("Summary error:", err);
        return res.status(500).json({
            totalMessages: 0,
            totalUsersUniqueWhatsAppUsers: 0,
            totalUsersUniqueNonWhatsAppUsers: 0,
        });
    }
});
function getUsernames() {
    const connection = mysql2_1.default.createConnection(mysqlConfig);
    return new Promise((resolve, reject) => {
        connection.query("SELECT DISTINCT session FROM auth", (err, results, fields) => {
            connection.end();
            if (err) {
                // Table doesn't exist yet (fresh DB) — no sessions, return empty
                if (err.code === "ER_NO_SUCH_TABLE")
                    return resolve([]);
                return reject(err);
            }
            //@ts-ignore
            resolve(results.map((result) => result.session));
        });
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
    }
    catch (err) {
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
            if (value.subject.trim().toLowerCase() ==
                req.params.name.trim().toLowerCase()) {
                console.log(key);
                id = key;
            }
        }
        res.send({ id });
    }
    catch (err) {
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
            const data = await bailey[username].mysock.groupFetchAllParticipating();
            const groups = [];
            for (const [key, value] of Object.entries(data)) {
                groups.push({ name: value.subject, id: key });
            }
            res.send(groups);
        }
        catch (err) {
            console.log("Error: ", err);
            res
                .status(500)
                .json({ message: "Internel server error.", error: String(err) });
        }
    }
    else {
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
        const groupName = req.body.name || "My test Group";
        const phoneNumbers = req.body.phoneNumbers || ["201000000000"];
        let isValid = true;
        const phoneNumersParsed = await Promise.all(phoneNumbers.map(async (phoneNumber) => {
            const ph = phoneNumber.replace("+", "").replace("-", "").replace(" ", "") +
                "@s.whatsapp.net";
            const on = await bailey[username].mysock.onWhatsApp(ph);
            if (!(on && on.length > 0)) {
                isValid = false;
            }
            return ph;
        }));
        if (isValid) {
            const group = await bailey[username].mysock.groupCreate(groupName, phoneNumersParsed);
            res.status(200).json({ group });
        }
        else {
            res.status(404).json({ message: "One of Users not found." });
        }
    }
    catch (err) {
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
        await bailey[username].mysock.sendMessage(ID, {
            text: message,
        });
        res.status(200).json({ message: "Message sent." });
    }
    catch (err) {
        console.log("Error: ", err);
        res
            .status(500)
            .json({ message: "Internel server error.", error: String(err) });
    }
});
app.post("/addgroupmembers", checkusername, async (req, res) => {
    const username = req.body.username;
    const groupId = req.body.groupId;
    const phoneNumbers = req.body.phoneNumbers;
    if (!bailey[username]?.mysock) {
        return res.status(310).json({
            message: "WhatsApp connection not established.",
        });
    }
    try {
        const participants = phoneNumbers.map((num) => {
            return num.replace(/\D/g, "") + "@c.us";
        });
        await bailey[username].mysock.groupParticipantsUpdate(groupId, participants, "add");
        res.status(200).json({
            message: "Members added successfully",
            groupId,
            participants,
        });
    }
    catch (err) {
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
        const on = await bailey[username].mysock.onWhatsApp(ID);
        if (!(on && on.length > 0)) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        let profilePictureUrl;
        try {
            profilePictureUrl = await bailey[username].mysock.profilePictureUrl(ID, "image");
        }
        catch (e) {
            profilePictureUrl = "";
        }
        res.status(200).json({
            message: profilePictureUrl,
            on,
        });
    }
    catch (err) {
        console.log("Error: ", err);
        res
            .status(500)
            .json({ message: "Internel server error.", error: String(err) });
    }
});
const dirname = path_1.default.resolve();
app.get("/backend/files*", (req, res) => {
    return (0, serve_handler_1.default)(req, res, {
        cleanUrls: false,
    });
});
app.get("*_sessions*", (req, res) => {
    return (0, serve_handler_1.default)(req, res, {
        cleanUrls: false,
    });
});
app.get("/melkmeshiqr", (req, res) => res.sendFile(path_1.default.join(dirname, "/melkmeshi.qr.png")));
app.use(express_1.default.static(path_1.default.join(dirname, "/frontend/dist")));
app.get("*", (req, res) => res.sendFile(path_1.default.join(dirname, "/frontend/dist/index.html")));
server.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
