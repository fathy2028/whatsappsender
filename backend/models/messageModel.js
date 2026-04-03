"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    onWhatsapp: { type: Boolean, required: true },
    message: { type: String, required: true },
}, {
    timestamps: true,
});
const Message = mongoose_1.default.model("Messages", messageSchema);
exports.default = Message;
