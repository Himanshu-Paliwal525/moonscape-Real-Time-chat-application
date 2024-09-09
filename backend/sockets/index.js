const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/userModel");
const { Chat } = require("../models/chatModel");
const { SECRET_KEY } = require("../config");

let users = {};

const setupSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log("New client connected", socket.id);

        socket.on("newUser", async (formData) => {
            const { username, email, password } = formData;
            try {
                const salt = await bcrypt.genSalt(10);
                const newPassword = await bcrypt.hash(password, salt);
                const newUser = new User({ username, email, password: newPassword });
                await newUser.save();
                const token = await jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
                socket.emit("signupSuccess", token);
                console.log("New User Created: ", newUser);
                socket.join(username);
                users[socket.id] = username;
                io.emit("newActiveUser", users);
            } catch (error) {
                console.error("Signup Error: ", error);
                socket.emit("signupError", { error: "Signup failed" });
            }
        });

        socket.on("login", async (formData) => {
            const { username, password } = formData;
            try {
                const user = await User.findOne({ username });
                if (!user) {
                    return socket.emit("loginError", { error: "No User Found!" });
                }
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    const token = await jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
                    socket.emit("loginSuccess", token);
                    socket.join(username);
                    users[socket.id] = username;
                    io.emit("newActiveUser", users);
                } else {
                    socket.emit("loginError", { error: "Invalid Credentials!" });
                }
            } catch (error) {
                console.error("Login Error: ", error);
                socket.emit("loginError", { error: "Login failed" });
            }
        });

        socket.on("ownMessage", async (msg) => {
            const { message, time, timestamp } = msg;
            const newMessage = { message: message.msg, timestamp };
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
            allMessages = sortMessagesByTimestamp(allMessages);
            socket.emit("sendMessage", { allMessages });
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

        socket.on("logout", () => {
            console.log("User logged out:", socket.id);
            delete users[socket.id];
            io.emit("newActiveUser", users);
        });

        socket.on("disconnect", () => {
            delete users[socket.id];
            io.emit("newActiveUser", users);
        });
    });
};

module.exports = { setupSocketHandlers };
