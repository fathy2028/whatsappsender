import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    onWhatsapp: { type: Boolean, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Messages", messageSchema);
export default Message;
