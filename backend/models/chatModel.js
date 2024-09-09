const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    user: { type: String, required: true },
    receiver: { type: String, required: true },
    time: { type: String },
    messages: [
        {
            message: { type: String, required: true },
            timestamp: { type: Number, required: true },
        },
    ],
});

const Chat = mongoose.model("chat", Schema);

module.exports = {Chat};