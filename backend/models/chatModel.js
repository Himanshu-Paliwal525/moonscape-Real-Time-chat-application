const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    user: { type: String, required: true },
    receiver: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Number, required: true },
    notification: { type: Boolean, default: false },
    voiceMessage: {
        type: {
            data: { type: Buffer, default: null },
            duration: { type: Number },
            mimeType: { type: String, default: null },
        },
        default: null,
    },
});
Schema.index({ user: 1, receiver: 1, timestamp: 1 });
const Chat = mongoose.model("chat", Schema);

module.exports = { Chat };