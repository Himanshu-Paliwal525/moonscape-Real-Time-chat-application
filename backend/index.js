const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
const mongoURI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/chat-app";
mongoose.connect(mongoURI);
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
const io = new Server({
    cors: {
        origin: "http://localhost:3000",
    },
});

let users = {};

io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    socket.on("newUser", (user) => {
        socket.join(user);
        users[socket.id] = user;
        io.emit("newActiveUser", users);
    });

    socket.on("ownMessage", async (msg) => {
        const { message, time, timestamp } = msg;
        const newMessage = {
            message: message.msg,
            timestamp,
        };
        const existingChat = await Chat.findOne({
            user: message.user,
            receiver: message.receiver,
        });

        if (existingChat) {
            existingChat.messages.push(newMessage);
            await existingChat.save();
        } else {
            const newChat = new Chat({
                user: message.user,
                receiver: message.receiver,
                time,
                messages: [newMessage],
            });
            await newChat.save();
        }

        const messages1 = await Chat.findOne({
            user: message.user,
            receiver: message.receiver,
        }).lean();

        const messages2 = await Chat.findOne({
            user: message.receiver,
            receiver: message.user,
        }).lean();

        let allMessages = [];
        let sender;
        let recepient;
        const sortMessagesByTimestamp = (messages) => {
            return messages.sort((a, b) => a.timestamp - b.timestamp);
        };

        if (messages1) {
            allMessages = messages1.messages.map((msg) => ({
                ...msg,
                user: messages1.user,
            }));
        }

        if (messages2) {
            allMessages = [
                ...allMessages,
                ...messages2.messages.map((msg) => ({
                    ...msg,
                    user: messages2.user,
                })),
            ];
        }

        // Sort allMessages array by timestamp
        allMessages = sortMessagesByTimestamp(allMessages);
        socket.emit("sendMessage", { sender, recepient, allMessages });
        io.to(message.receiver).emit("send", {
            all: allMessages,
            recepient: message.receiver,
            sender: message.user,
        });
    });

    socket.on("setReceiver", async ({ user, receiver }) => {
        const messages1 = await Chat.findOne({ user, receiver }).lean();
        const messages2 = await Chat.findOne({
            user: receiver,
            receiver: user,
        }).lean();

        let allMessages = [];
        const sortMessagesByTimestamp = (messages) => {
            return messages.sort((a, b) => a.timestamp - b.timestamp);
        };
        if (messages1) {
            allMessages = [
                ...messages1.messages.map((msg) => ({
                    ...msg,
                    user: messages1.user,
                })),
            ];
        }
        if (messages2) {
            allMessages = [
                ...allMessages,
                ...messages2.messages.map((msg) => ({
                    ...msg,
                    user: messages2.user,
                })),
            ];
        }
        allMessages = sortMessagesByTimestamp(allMessages);

        socket.emit("fetchMessages", allMessages);
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("newActiveUser", users);
    });
});

io.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
