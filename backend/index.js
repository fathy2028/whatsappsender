"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var baileys_1 = __importStar(require("baileys"));
var xlsx_1 = __importDefault(require("xlsx"));
var fs_1 = require("fs");
var pino_1 = __importDefault(require("pino"));
var path_1 = __importDefault(require("path"));
var qr_image_1 = __importDefault(require("qr-image"));
var express_1 = __importDefault(require("express"));
var rimraf_1 = require("rimraf");
var path_2 = require("path");
var express_fileupload_1 = __importDefault(require("express-fileupload"));
var ws_1 = __importDefault(require("ws"));
var http_1 = __importDefault(require("http"));
var qrcode_1 = __importDefault(require("qrcode"));
var cors_1 = __importDefault(require("cors"));
var mongoose_1 = __importDefault(require("mongoose"));
var dotenv_1 = __importDefault(require("dotenv"));
var messageModel_1 = __importDefault(require("./models/messageModel"));
var serve_handler_1 = __importDefault(require("serve-handler"));
var fs_2 = __importDefault(require("fs"));
var mysql_baileys_1 = require("mysql-baileys");
var mysql2_1 = __importDefault(require("mysql2"));
var mysqlConfig = {
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    database: process.env.MYSQL_DATABASE || "whatsapp",
};
var app = (0, express_1.default)();
app.use((0, cors_1.default)());
var server = http_1.default.createServer(app);
var wss = new ws_1.default.Server({ server: server });
var userConnections = {};
dotenv_1.default.config();
var bailey = {};
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(function () { return __awaiter(void 0, void 0, void 0, function () {
    var usernames, _i, usernames_1, username;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Connected to MongoDB");
                return [4 /*yield*/, getUsernames()];
            case 1:
                usernames = _a.sent();
                for (_i = 0, usernames_1 = usernames; _i < usernames_1.length; _i++) {
                    username = usernames_1[_i];
                    if (!bailey.hasOwnProperty(username)) {
                        console.log("Creating new instance for: ", username);
                        bailey[username] = new BaileysProvider(username);
                    }
                }
                return [2 /*return*/];
        }
    });
}); })
    .catch(function (error) { return console.log(error.message); });
wss.on("connection", function (ws) {
    ws.on("message", function (message) {
        var _a;
        //@ts-ignore
        var data = JSON.parse(message);
        if (data.type === "set-username") {
            var username = data.username;
            if (!bailey.hasOwnProperty(username)) {
                if (!username)
                    return;
                bailey[username] = new BaileysProvider(username);
            }
            userConnections[username] = { ws: ws };
            if (qrs[username]) {
                ws.send(JSON.stringify({
                    type: "qr-code",
                    message: qrs[username],
                }));
            }
            if ((_a = bailey[username]) === null || _a === void 0 ? void 0 : _a.mysock) {
                ws.send(JSON.stringify({
                    type: "authenticated",
                }));
            }
        }
    });
    ws.on("close", function () {
        for (var username in userConnections) {
            if (userConnections[username].ws === ws) {
                delete userConnections[username];
                break;
            }
        }
    });
});
var PORT = process.env.PORT || 3000;
var qrs = {};
var baileyGenerateImage = function (base64_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([base64_1], args_1, true), void 0, function (base64, name) {
        var username, PATH_QR, qr_svg, writeFilePromise;
        if (name === void 0) { name = "qr.png"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    username = name.replace(".qr.png", "");
                    qrcode_1.default.toDataURL(base64).then(function (url) {
                        qrs[username] = url;
                    });
                    if (userConnections[username]) {
                        qrcode_1.default.toDataURL(base64).then(function (url) {
                            userConnections[username].ws.send(JSON.stringify({
                                type: "qr-code",
                                message: url,
                            }));
                        });
                    }
                    PATH_QR = "".concat(process.cwd(), "/").concat(name);
                    qr_svg = qr_image_1.default.image(base64, { type: "png", margin: 4 });
                    writeFilePromise = function () {
                        return new Promise(function (resolve, reject) {
                            var file = qr_svg.pipe((0, fs_1.createWriteStream)(PATH_QR));
                            file.on("finish", function () { return resolve(true); });
                            file.on("error", reject);
                        });
                    };
                    return [4 /*yield*/, writeFilePromise()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
var BaileysProvider = /** @class */ (function () {
    function BaileysProvider(name) {
        var _this = this;
        this.initBailey = function () { return __awaiter(_this, void 0, void 0, function () {
            var NAME_DIR_SESSION, _a, state, saveCreds, removeCreds, version, sock_1, e_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        NAME_DIR_SESSION = "".concat(this.name, "_sessions");
                        return [4 /*yield*/, (0, mysql_baileys_1.useMySQLAuthState)(__assign(__assign({}, mysqlConfig), { session: this.name }))];
                    case 1:
                        _a = _b.sent(), state = _a.state, saveCreds = _a.saveCreds, removeCreds = _a.removeCreds;
                        this.saveCredsGlobal = saveCreds;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, baileys_1.fetchLatestBaileysVersion)()];
                    case 3:
                        version = (_b.sent()).version;
                        sock_1 = (0, baileys_1.default)({
                            version: version,
                            printQRInTerminal: false,
                            auth: state,
                            markOnlineOnConnect: false,
                            syncFullHistory: false,
                            //@ts-ignore
                            logger: (0, pino_1.default)({ level: "fatal" }),
                        });
                        sock_1.ev.on("presence.update", function (upsert) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                console.log("presence.update", upsert);
                                return [2 /*return*/];
                            });
                        }); });
                        sock_1.ev.on("connection.update", function (update) { return __awaiter(_this, void 0, void 0, function () {
                            var connection, lastDisconnect, qr, statusCode, PATH_BASE;
                            var _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        connection = update.connection, lastDisconnect = update.lastDisconnect, qr = update.qr;
                                        statusCode = (_b = (_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode;
                                        if (connection === "close") {
                                            if (statusCode !== baileys_1.DisconnectReason.loggedOut) {
                                                this.initBailey();
                                            }
                                            if (statusCode === baileys_1.DisconnectReason.loggedOut) {
                                                PATH_BASE = (0, path_2.join)(process.cwd(), NAME_DIR_SESSION);
                                                (0, rimraf_1.rimraf)(PATH_BASE);
                                                this.initBailey();
                                            }
                                        }
                                        if (connection === "open") {
                                            console.log("".concat(this.name, " is : ready"));
                                            // sock.presenceSubscribe("218910441322@s.whatsapp.net");
                                            (_c = userConnections[this.name]) === null || _c === void 0 ? void 0 : _c.ws.send(JSON.stringify({
                                                type: "authenticated",
                                            }));
                                            this.initBusEvents(sock_1);
                                        }
                                        if (!qr) return [3 /*break*/, 3];
                                        this.qrRetry++;
                                        if (!(this.qrRetry >= 3)) return [3 /*break*/, 1];
                                        qrs[this.name] = "";
                                        console.log("socket connection terminated");
                                        userConnections[this.name].ws.send(JSON.stringify({
                                            type: "qr-code",
                                            message: "Bye",
                                        }));
                                        delete userConnections[this.name];
                                        delete bailey[this.name];
                                        return [2 /*return*/];
                                    case 1: return [4 /*yield*/, baileyGenerateImage(qr, "".concat(this.name, ".qr.png"))];
                                    case 2:
                                        _d.sent();
                                        _d.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        sock_1.ev.on("creds.update", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, saveCreds()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _b.sent();
                        console.log(e_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.initBusEvents = function (_sock) {
            _this.mysock = _sock;
        };
        this.name = name;
        this.qrRetry = 0;
        this.mysock = undefined;
        this.saveCredsGlobal = undefined;
        this.sendMessageWTyping = function (msg, jid) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mysock.presenceSubscribe(jid)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, baileys_1.delay)(500)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.mysock.sendPresenceUpdate("composing", jid)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, (0, baileys_1.delay)(2000)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.mysock.sendPresenceUpdate("paused", jid)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.mysock.sendMessage(jid, msg)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, (0, baileys_1.delay)(2000)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.initBailey().then();
    }
    return BaileysProvider;
}());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_fileupload_1.default)());
var checkusername = function (req, res, next) {
    if (bailey.hasOwnProperty(req.body.username)) {
        next();
    }
    else {
        res.status(404).send({ message: "User not found" });
    }
};
app.post("/sendxlsx", checkusername, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var file, messageColName, username, colName, ext, filename, uploadPath, xlsx, temps, conclusion, _i, temps_1, temp, number, phoneMessage, filterNumber, on, isOnWhatsapp, MessageDatabase, e_2;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                file = req.files.file;
                messageColName = req.body.message;
                username = req.body.username;
                colName = req.body.colname;
                ext = path_1.default.extname(file.name);
                filename = Date.now() + ext;
                uploadPath = "./backend/files/" + filename;
                file.mv(uploadPath, function (err) {
                    if (err)
                        return res.status(500).send(err);
                });
                xlsx = xlsx_1.default.read(file.data, { type: "buffer" });
                temps = xlsx_1.default.utils.sheet_to_json(xlsx.Sheets[xlsx.SheetNames[0]]);
                conclusion = [];
                _i = 0, temps_1 = temps;
                _c.label = 1;
            case 1:
                if (!(_i < temps_1.length)) return [3 /*break*/, 12];
                temp = temps_1[_i];
                number = temp[colName].toString();
                phoneMessage = temp[messageColName];
                filterNumber = number.replace(/\D/g, "");
                console.log(filterNumber);
                if (filterNumber.startsWith("20")) {
                }
                else if (filterNumber.startsWith("0")) {
                    filterNumber = "20" + filterNumber.substring(1);
                }
                else {
                    filterNumber = "20" + filterNumber;
                }
                _c.label = 2;
            case 2:
                _c.trys.push([2, 9, , 11]);
                return [4 /*yield*/, ((_b = (_a = bailey[username]) === null || _a === void 0 ? void 0 : _a.mysock) === null || _b === void 0 ? void 0 : _b.onWhatsApp("".concat(filterNumber, "@s.whatsapp.net")))];
            case 3:
                on = _c.sent();
                isOnWhatsapp = on && on.length > 0 ? true : false;
                conclusion.push({
                    username: username,
                    phoneNumber: "+".concat(filterNumber),
                    onWhatsapp: isOnWhatsapp,
                    message: phoneMessage,
                });
                MessageDatabase = new messageModel_1.default({
                    username: username,
                    phoneNumber: "".concat(filterNumber, "@s.whatsapp.net"),
                    onWhatsapp: isOnWhatsapp,
                    message: phoneMessage,
                });
                if (!isOnWhatsapp) return [3 /*break*/, 5];
                return [4 /*yield*/, bailey[username].sendMessageWTyping({ text: phoneMessage }, "".concat(filterNumber, "@s.whatsapp.net"))];
            case 4:
                _c.sent();
                return [3 /*break*/, 7];
            case 5: 
            //send message to the group
            return [4 /*yield*/, bailey[username].sendMessageWTyping({ text: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 ".concat(number, " \u0644\u0627 \u064A\u0648\u062C\u062F \u0639\u0644\u064A\u0647 \u062A\u0637\u0628\u064A\u0642 \u0648\u0627\u062A\u0633 \u0627\u0628") }, "120363415834329316@g.us")];
            case 6:
                //send message to the group
                _c.sent();
                console.log("User not found: ", filterNumber);
                _c.label = 7;
            case 7: return [4 /*yield*/, MessageDatabase.save()];
            case 8:
                _c.sent();
                return [3 /*break*/, 11];
            case 9:
                e_2 = _c.sent();
                return [4 /*yield*/, bailey[username].sendMessageWTyping({ text: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 ".concat(number, " \u0644\u0627 \u064A\u0648\u062C\u062F \u0639\u0644\u064A\u0647 \u062A\u0637\u0628\u064A\u0642 \u0648\u0627\u062A\u0633 \u0627\u0628") }, "120363415834329316@g.us")];
            case 10:
                _c.sent();
                console.log("User Faild: ", filterNumber);
                return [3 /*break*/, 11];
            case 11:
                _i++;
                return [3 /*break*/, 1];
            case 12: return [4 /*yield*/, bailey[username].sendMessageWTyping({
                    text: "\u0627\u0631\u0642\u0627\u0645 \u0627\u0644\u0647\u0648\u0627\u062A\u0641 \u0627\u0644\u0630\u064A\u0646 \u0644\u064A\u0633 \u0644\u062F\u064A\u0647\u0645 \u0648\u0627\u062A\u0633 \u0627\u0628 \n ".concat(Array.from(new Set(conclusion
                        .filter(function (item) { return item.onWhatsapp === false; })
                        .map(function (item) { return item.phoneNumber; }))).join("\n")),
                }, "120363415834329316@g.us")];
            case 13:
                _c.sent();
                return [4 /*yield*/, bailey[username].sendMessageWTyping({
                        text: "\u0627\u0631\u0642\u0627\u0645 \u0627\u0644\u0647\u0648\u0627\u062A\u0641 \u0627\u0644\u0630\u064A\u0646 \u0644\u062F\u064A\u0647\u0645 \u0648\u0627\u062A\u0633 \u0627\u0628 \n ".concat(Array.from(new Set(conclusion
                            .filter(function (item) { return item.onWhatsapp === true; })
                            .map(function (item) { return item.phoneNumber; }))).join("\n")),
                    }, "120363415834329316@g.us")];
            case 14:
                _c.sent();
                fs_2.default.unlinkSync(uploadPath);
                res.send("ok");
                return [2 /*return*/];
        }
    });
}); });
app.post("/", checkusername, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, phoneNumber, message, on, err_1;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                username = req.body.username;
                if (!bailey[username].mysock) {
                    console.log("WhatsApp connection not established.");
                    return [2 /*return*/, res
                            .status(310)
                            .json({ message: "WhatsApp connection not established." })];
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 6, , 7]);
                phoneNumber = req.body.phoneNumber || "201000000000";
                message = req.body.message || "hi";
                phoneNumber = phoneNumber
                    .replaceAll("+", "")
                    .replaceAll("-", "")
                    .replaceAll(" ", "")
                    .replaceAll("(", "")
                    .replaceAll(")", "");
                if (phoneNumber[2] === "0") {
                    phoneNumber = phoneNumber.slice(0, 2) + phoneNumber.slice(3);
                }
                return [4 /*yield*/, ((_b = (_a = bailey[username]) === null || _a === void 0 ? void 0 : _a.mysock) === null || _b === void 0 ? void 0 : _b.onWhatsApp(phoneNumber))];
            case 2:
                on = _d.sent();
                if (!on) {
                    res.status(404).json({ message: "User not found." });
                    return [2 /*return*/];
                }
                if (!(on.length > 0)) return [3 /*break*/, 4];
                console.log("Sending message to: ", phoneNumber);
                return [4 /*yield*/, ((_c = bailey[username]) === null || _c === void 0 ? void 0 : _c.sendMessageWTyping({
                        text: message,
                    }, "".concat(phoneNumber, "@s.whatsapp.net")))];
            case 3:
                _d.sent();
                res.status(200).json({ message: "Message sent." });
                return [3 /*break*/, 5];
            case 4:
                console.log("User not found: ", phoneNumber);
                res.status(404).json({ message: "User not found." });
                _d.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                err_1 = _d.sent();
                console.log("Error: ", err_1);
                res
                    .status(500)
                    .json({ message: "Internel server error.", error: String(err_1) });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.post("/sendvideo", checkusername, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var video, numbers, caption, username, numbersArray, _i, numbersArray_1, number, filterNumber, on, isOnWhatsapp, MessageDatabase;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                video = req.files.video;
                numbers = req.body.phoneNumbers;
                caption = req.body.caption;
                username = req.body.username;
                numbersArray = numbers.split("\n");
                _i = 0, numbersArray_1 = numbersArray;
                _c.label = 1;
            case 1:
                if (!(_i < numbersArray_1.length)) return [3 /*break*/, 7];
                number = numbersArray_1[_i];
                var raw = number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").replace(/\s/g, "");
                filterNumber = raw.startsWith("20") ? raw : raw.startsWith("0") ? "20" + raw.substring(1) : "20" + raw;
                return [4 /*yield*/, ((_b = (_a = bailey[username]) === null || _a === void 0 ? void 0 : _a.mysock) === null || _b === void 0 ? void 0 : _b.onWhatsApp(filterNumber))];
            case 2:
                on = _c.sent();
                isOnWhatsapp = on && on.length > 0 ? true : false;
                MessageDatabase = new messageModel_1.default({
                    username: username,
                    phoneNumber: "".concat(filterNumber, "@s.whatsapp.net"),
                    onWhatsapp: isOnWhatsapp,
                    message: "Video",
                });
                if (!isOnWhatsapp) return [3 /*break*/, 4];
                return [4 /*yield*/, bailey[username].sendMessageWTyping({
                        video: video.data,
                        caption: caption !== null && caption !== void 0 ? caption : "",
                        gifPlayback: false,
                    }, "".concat(filterNumber, "@s.whatsapp.net"))];
            case 3:
                _c.sent();
                _c.label = 4;
            case 4: return [4 /*yield*/, MessageDatabase.save()];
            case 5:
                _c.sent();
                _c.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 1];
            case 7:
                res.send("ok");
                return [2 /*return*/];
        }
    });
}); });
app.post("/sendimage", checkusername, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var image, numbers, caption, username, numbersArray, _i, numbersArray_2, number, filterNumber, on, isOnWhatsapp, MessageDatabase;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                image = req.files.image;
                numbers = req.body.phoneNumbers;
                caption = req.body.caption;
                username = req.body.username;
                numbersArray = numbers.split("\n");
                _i = 0, numbersArray_2 = numbersArray;
                _c.label = 1;
            case 1:
                if (!(_i < numbersArray_2.length)) return [3 /*break*/, 7];
                number = numbersArray_2[_i];
                var raw = number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").replace(/\s/g, "");
                filterNumber = raw.startsWith("20") ? raw : raw.startsWith("0") ? "20" + raw.substring(1) : "20" + raw;
                console.log(filterNumber);
                return [4 /*yield*/, ((_b = (_a = bailey[username]) === null || _a === void 0 ? void 0 : _a.mysock) === null || _b === void 0 ? void 0 : _b.onWhatsApp(filterNumber))];
            case 2:
                on = _c.sent();
                isOnWhatsapp = on && on.length > 0 ? true : false;
                MessageDatabase = new messageModel_1.default({
                    username: username,
                    phoneNumber: "".concat(filterNumber, "@s.whatsapp.net"),
                    onWhatsapp: isOnWhatsapp,
                    message: "Photo",
                });
                if (!isOnWhatsapp) return [3 /*break*/, 4];
                return [4 /*yield*/, bailey[username].sendMessageWTyping({
                        image: image.data,
                        caption: caption !== null && caption !== void 0 ? caption : "",
                    }, "".concat(filterNumber, "@s.whatsapp.net"))];
            case 3:
                _c.sent();
                _c.label = 4;
            case 4: return [4 /*yield*/, MessageDatabase.save()];
            case 5:
                _c.sent();
                _c.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 1];
            case 7:
                res.send("ok");
                return [2 /*return*/];
        }
    });
}); });
app.post("/sendfile", checkusername, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var file, numbers, username, numbersArray, _i, numbersArray_3, number, filterNumber, on, isOnWhatsapp, MessageDatabase;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                file = req.files.file;
                numbers = req.body.phoneNumbers;
                username = req.body.username;
                numbersArray = numbers.split("\n");
                _i = 0, numbersArray_3 = numbersArray;
                _c.label = 1;
            case 1:
                if (!(_i < numbersArray_3.length)) return [3 /*break*/, 7];
                number = numbersArray_3[_i];
                var raw = number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").replace(/\s/g, "");
                filterNumber = raw.startsWith("20") ? raw : raw.startsWith("0") ? "20" + raw.substring(1) : "20" + raw;
                return [4 /*yield*/, ((_b = (_a = bailey[username]) === null || _a === void 0 ? void 0 : _a.mysock) === null || _b === void 0 ? void 0 : _b.onWhatsApp(filterNumber))];
            case 2:
                on = _c.sent();
                isOnWhatsapp = on && on.length > 0 ? true : false;
                MessageDatabase = new messageModel_1.default({
                    username: username,
                    phoneNumber: "".concat(filterNumber, "@s.whatsapp.net"),
                    onWhatsapp: isOnWhatsapp,
                    message: "File",
                });
                if (!isOnWhatsapp) return [3 /*break*/, 4];
                return [4 /*yield*/, bailey[username].sendMessageWTyping({
                        document: file.data,
                        mimetype: file.mimetype,
                        fileName: file.name,
                    }, "".concat(filterNumber, "@s.whatsapp.net"))];
            case 3:
                _c.sent();
                _c.label = 4;
            case 4: return [4 /*yield*/, MessageDatabase.save()];
            case 5:
                _c.sent();
                _c.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 1];
            case 7:
                res.send("ok");
                return [2 /*return*/];
        }
    });
}); });
app.post("/bulk", checkusername, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var phoneMessage, numbersArray, username, _i, numbersArray_4, number, filterNumber, on, isOnWhatsapp, MessageDatabase;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                phoneMessage = req.body.message;
                numbersArray = req.body.numbers;
                username = req.body.username;
                _i = 0, numbersArray_4 = numbersArray;
                _c.label = 1;
            case 1:
                if (!(_i < numbersArray_4.length)) return [3 /*break*/, 7];
                number = numbersArray_4[_i];
                var raw = number.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "").replace(/\s/g, "");
                filterNumber = raw.startsWith("20") ? raw : raw.startsWith("0") ? "20" + raw.substring(1) : "20" + raw;
                return [4 /*yield*/, ((_b = (_a = bailey[username]) === null || _a === void 0 ? void 0 : _a.mysock) === null || _b === void 0 ? void 0 : _b.onWhatsApp(filterNumber))];
            case 2:
                on = _c.sent();
                isOnWhatsapp = on && on.length > 0 ? true : false;
                MessageDatabase = new messageModel_1.default({
                    username: username,
                    phoneNumber: "".concat(filterNumber, "@s.whatsapp.net"),
                    onWhatsapp: isOnWhatsapp,
                    message: phoneMessage,
                });
                if (!isOnWhatsapp) return [3 /*break*/, 4];
                return [4 /*yield*/, bailey[username].sendMessageWTyping({ text: phoneMessage }, "".concat(filterNumber, "@s.whatsapp.net"))];
            case 3:
                _c.sent();
                _c.label = 4;
            case 4: return [4 /*yield*/, MessageDatabase.save()];
            case 5:
                _c.sent();
                _c.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 1];
            case 7:
                res.send("ok");
                return [2 /*return*/];
        }
    });
}); });
app.post("/summery", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, totalMessages, uniqueWhatsAppUsers, totalUsersUniqueWhatsAppUsers, uniqueNonWhatsAppUsers, totalUsersUniqueNonWhatsAppUsers;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.body.username;
                return [4 /*yield*/, messageModel_1.default.countDocuments({ username: username })];
            case 1:
                totalMessages = _a.sent();
                return [4 /*yield*/, messageModel_1.default.distinct("phoneNumber", {
                        username: username,
                        onWhatsapp: true,
                    })];
            case 2:
                uniqueWhatsAppUsers = _a.sent();
                totalUsersUniqueWhatsAppUsers = uniqueWhatsAppUsers.length;
                return [4 /*yield*/, messageModel_1.default.distinct("phoneNumber", {
                        username: username,
                        onWhatsapp: false,
                    })];
            case 3:
                uniqueNonWhatsAppUsers = _a.sent();
                totalUsersUniqueNonWhatsAppUsers = uniqueNonWhatsAppUsers.length;
                return [2 /*return*/, res.send({
                        totalMessages: totalMessages,
                        totalUsersUniqueWhatsAppUsers: totalUsersUniqueWhatsAppUsers,
                        totalUsersUniqueNonWhatsAppUsers: totalUsersUniqueNonWhatsAppUsers,
                    })];
        }
    });
}); });
function getUsernames() {
    var connection = mysql2_1.default.createConnection(mysqlConfig);
    return new Promise(function (resolve, reject) {
        connection.query("SELECT DISTINCT session FROM auth", function (err, results, fields) {
            connection.end();
            if (err) {
                if (err.code === "ER_NO_SUCH_TABLE") return resolve([]);
                return reject(err);
            }
            //@ts-ignore
            resolve(results.map(function (result) { return result.session; }));
        });
    });
}
app.get("/usernames", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = res).send;
                return [4 /*yield*/, getUsernames()];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
app.get("/allgroups", checkusername, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, data, err_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                username = req.body.username;
                if (!bailey[username].mysock) {
                    console.log("WhatsApp connection not established.");
                    return [2 /*return*/, res
                            .status(310)
                            .json({ message: "WhatsApp connection not established." })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, ((_a = bailey[username].mysock) === null || _a === void 0 ? void 0 : _a.groupFetchAllParticipating())];
            case 2:
                data = _b.sent();
                res.send({ data: data });
                return [3 /*break*/, 4];
            case 3:
                err_2 = _b.sent();
                console.log("Error: ", err_2);
                res
                    .status(500)
                    .json({ message: "Internel server error.", error: String(err_2) });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post("/getgroupid/:name", checkusername, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, data, id, _i, _a, _b, key, value, err_3;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                username = req.body.username;
                if (!bailey[username].mysock) {
                    console.log("WhatsApp connection not established.");
                    return [2 /*return*/, res
                            .status(310)
                            .json({ message: "WhatsApp connection not established." })];
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                return [4 /*yield*/, ((_c = bailey[username].mysock) === null || _c === void 0 ? void 0 : _c.groupFetchAllParticipating())];
            case 2:
                data = _d.sent();
                if (!data) {
                    res.send({ message: "No groups found." });
                    return [2 /*return*/];
                }
                id = "";
                for (_i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
                    _b = _a[_i], key = _b[0], value = _b[1];
                    if (value.subject.trim().toLowerCase() ==
                        req.params.name.trim().toLowerCase()) {
                        console.log(key);
                        id = key;
                    }
                }
                res.send({ id: id });
                return [3 /*break*/, 4];
            case 3:
                err_3 = _d.sent();
                console.log("Error: ", err_3);
                res
                    .status(500)
                    .json({ message: "Internel server error.", error: String(err_3) });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get("/getgroups/:username", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, data, groups, _i, _a, _b, key, value, err_4;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                username = req.params.username;
                if (!bailey.hasOwnProperty(username)) return [3 /*break*/, 5];
                if (!bailey[username].mysock) {
                    console.log("WhatsApp connection not established.");
                    return [2 /*return*/, res
                            .status(310)
                            .json({ message: "WhatsApp connection not established." })];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, bailey[username].mysock.groupFetchAllParticipating()];
            case 2:
                data = _c.sent();
                groups = [];
                for (_i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
                    _b = _a[_i], key = _b[0], value = _b[1];
                    groups.push({ name: value.subject, id: key });
                }
                res.send(groups);
                return [3 /*break*/, 4];
            case 3:
                err_4 = _c.sent();
                console.log("Error: ", err_4);
                res
                    .status(500)
                    .json({ message: "Internel server error.", error: String(err_4) });
                return [3 /*break*/, 4];
            case 4: return [3 /*break*/, 6];
            case 5:
                res.status(404).json({ message: "User not found." });
                _c.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); });
app.post("/newgroup", checkusername, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, groupName, phoneNumbers, isValid_1, phoneNumersParsed, group, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.body.username;
                if (!bailey[username].mysock) {
                    console.log("WhatsApp connection not established.");
                    return [2 /*return*/, res
                            .status(310)
                            .json({ message: "WhatsApp connection not established." })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                groupName = req.body.name || "My test Group";
                phoneNumbers = req.body.phoneNumbers || ["201000000000"];
                isValid_1 = true;
                return [4 /*yield*/, Promise.all(phoneNumbers.map(function (phoneNumber) { return __awaiter(void 0, void 0, void 0, function () {
                        var ph, on;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    ph = phoneNumber.replace("+", "").replace("-", "").replace(" ", "") +
                                        "@s.whatsapp.net";
                                    return [4 /*yield*/, bailey[username].mysock.onWhatsApp(ph)];
                                case 1:
                                    on = _a.sent();
                                    if (!(on && on.length > 0)) {
                                        isValid_1 = false;
                                    }
                                    return [2 /*return*/, ph];
                            }
                        });
                    }); }))];
            case 2:
                phoneNumersParsed = _a.sent();
                if (!isValid_1) return [3 /*break*/, 4];
                return [4 /*yield*/, bailey[username].mysock.groupCreate(groupName, phoneNumersParsed)];
            case 3:
                group = _a.sent();
                res.status(200).json({ group: group });
                return [3 /*break*/, 5];
            case 4:
                res.status(404).json({ message: "One of Users not found." });
                _a.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                err_5 = _a.sent();
                console.log("Error: ", err_5);
                res
                    .status(500)
                    .json({ message: "Internel server error.", error: String(err_5) });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.post("/id", checkusername, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, ID, message, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.body.username;
                ID = req.body.id;
                message = req.body.message || "hi";
                if (!bailey[username].mysock) {
                    console.log("WhatsApp connection not established.");
                    return [2 /*return*/, res
                            .status(310)
                            .json({ message: "WhatsApp connection not established." })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                if (!ID) {
                    res.status(400).json({ message: "id is required." });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, bailey[username].mysock.sendMessage(ID, {
                        text: message,
                    })];
            case 2:
                _a.sent();
                res.status(200).json({ message: "Message sent." });
                return [3 /*break*/, 4];
            case 3:
                err_6 = _a.sent();
                console.log("Error: ", err_6);
                res
                    .status(500)
                    .json({ message: "Internel server error.", error: String(err_6) });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post("/addgroupmembers", checkusername, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, groupId, phoneNumbers, participants, err_7;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                username = req.body.username;
                groupId = req.body.groupId;
                phoneNumbers = req.body.phoneNumbers;
                if (!((_a = bailey[username]) === null || _a === void 0 ? void 0 : _a.mysock)) {
                    return [2 /*return*/, res.status(310).json({
                            message: "WhatsApp connection not established.",
                        })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                participants = phoneNumbers.map(function (num) {
                    return num.replace(/\D/g, "") + "@c.us";
                });
                return [4 /*yield*/, bailey[username].mysock.groupParticipantsUpdate(groupId, participants, "add")];
            case 2:
                _b.sent();
                res.status(200).json({
                    message: "Members added successfully",
                    groupId: groupId,
                    participants: participants,
                });
                return [3 /*break*/, 4];
            case 3:
                err_7 = _b.sent();
                console.log("Add group error:", err_7);
                res.status(500).json({
                    message: "Failed to add members",
                    error: String(err_7),
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post("/pfp", checkusername, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, phoneNumber, ID, on, profilePictureUrl, e_3, err_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.body.username;
                phoneNumber = req.body.phoneNumber;
                if (!bailey[username].mysock) {
                    console.log("WhatsApp connection not established.");
                    return [2 /*return*/, res
                            .status(310)
                            .json({ message: "WhatsApp connection not established." })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 7, , 8]);
                if (!phoneNumber) {
                    res.status(400).json({ message: "phoneNumber is required." });
                    return [2 /*return*/];
                }
                ID = "".concat(phoneNumber, "@s.whatsapp.net");
                return [4 /*yield*/, bailey[username].mysock.onWhatsApp(ID)];
            case 2:
                on = _a.sent();
                if (!(on && on.length > 0)) {
                    res.status(404).json({ message: "User not found." });
                    return [2 /*return*/];
                }
                profilePictureUrl = void 0;
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, bailey[username].mysock.profilePictureUrl(ID, "image")];
            case 4:
                profilePictureUrl = _a.sent();
                return [3 /*break*/, 6];
            case 5:
                e_3 = _a.sent();
                profilePictureUrl = "";
                return [3 /*break*/, 6];
            case 6:
                res.status(200).json({
                    message: profilePictureUrl,
                    on: on,
                });
                return [3 /*break*/, 8];
            case 7:
                err_8 = _a.sent();
                console.log("Error: ", err_8);
                res
                    .status(500)
                    .json({ message: "Internel server error.", error: String(err_8) });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
var dirname = path_1.default.resolve();
app.get("/backend/files*", function (req, res) {
    return (0, serve_handler_1.default)(req, res, {
        cleanUrls: false,
    });
});
app.get("*_sessions*", function (req, res) {
    return (0, serve_handler_1.default)(req, res, {
        cleanUrls: false,
    });
});
app.get("/melkmeshiqr", function (req, res) {
    return res.sendFile(path_1.default.join(dirname, "/melkmeshi.qr.png"));
});
app.use(express_1.default.static(path_1.default.join(dirname, "/frontend/dist")));
app.get("*", function (req, res) {
    return res.sendFile(path_1.default.join(dirname, "/frontend/dist/index.html"));
});
server.listen(PORT, function () {
    console.log("Server is running on port 3000");
});
