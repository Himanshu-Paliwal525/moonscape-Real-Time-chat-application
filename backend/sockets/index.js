const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/userModel");
const { Chat } = require("../models/chatModel");
const { SECRET_KEY } = require("../config");
const { transformVoiceMessage } = require("../Utils/TransformVoiceMessage");
let users = {};

const setupSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log("New client connected", socket.id);

        socket.on("newUser", async (formData) => {
            const { username, email, password } = formData;
            try {
                const salt = await bcrypt.genSalt(10);
                const newPassword = await bcrypt.hash(password, salt);
                const newUser = new User({
                    username,
                    email,
                    password: newPassword,
                });
                await newUser.save();
                if (SECRET_KEY) {
                    const token = jwt.sign({ username }, SECRET_KEY, {
                        expiresIn: "1h",
                    });
                    socket.emit("signupSuccess", token);
                }
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
                    return socket.emit("loginError", {
                        error: "No User Found!",
                    });
                }
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch && SECRET_KEY) {
                    const token = jwt.sign({ username }, SECRET_KEY, {
                        expiresIn: "1h",
                    });
                    socket.emit("loginSuccess", token);
                    socket.join(username);
                    users[socket.id] = username;
                    io.emit("newActiveUser", users);
                } else {
                    socket.emit("loginError", {
                        error: "Invalid Credentials!",
                    });
                }
            } catch (error) {
                console.error("Login Error: ", error);
                socket.emit("loginError", { error: "Login failed" });
            }
        });

        socket.on("ownMessage", async (msg) => {
            const { message, timestamp } = msg;
            const newChat = new Chat({
                user: message.user,
                receiver: message.receiver,
                message: message.msg,
                timestamp,
            });
            await newChat.save();
            let allMessages = transformVoiceMessage(
                await Chat.find({
                    $or: [
                        { user: message.user, receiver: message.receiver },
                        { user: message.receiver, receiver: message.user },
                    ],
                })
                    .sort({ timestamp: 1 })
                    .lean()
            );

            socket.emit("sendMessage", allMessages);
            io.to(message.receiver).emit("send", allMessages);
        });

        socket.on("setReceiver", async ({ user, receiver }) => {
            const allMessages = transformVoiceMessage(
                await Chat.find({
                    $or: [
                        { user, receiver },
                        { user: receiver, receiver: user },
                    ],
                })
                    .sort({ timestamp: 1 })
                    .lean()
            );

            socket.emit("fetchMessages", allMessages);
        });

        socket.on("logout", () => {
            console.log("User logged out:", socket.id);
            delete users[socket.id];
            io.emit("newActiveUser", users);
        });

        socket.on(
            "DeleteSelectedMessages",
            async ({ selected, user1, user2 }) => {
                await Chat.deleteMany({
                    timestamp: { $in: selected },
                });
                await new Chat({
                    user: user1,
                    receiver: user2,
                    timestamp: Date.now(),
                    message: `${user1} deleted some messages.`,
                    notification: true,
                }).save();
                const allMessages = transformVoiceMessage(
                    await Chat.find({
                        $or: [
                            { user: user1, receiver: user2 },
                            { user: user2, receiver: user1 },
                        ],
                    })
                        .sort({ timestamp: 1 })
                        .lean()
                );

                io.to(user2).emit("fetchMessages", allMessages);
                socket.emit("fetchMessages", allMessages);
            }
        );
        socket.on(
            "sendVoiceMessage",
            async ({ user, receiver, audio, duration }) => {
                try {
                    // Convert Base64 string 'audio' to Buffer

                    console.log(
                        "audio received in base64 encoding, ",
                        typeof audio
                    );
                    const audioBuffer = Buffer.from(audio, "base64");

                    // Create a new chat document
                    const newChat = new Chat({
                        user,
                        receiver,
                        message: "Voice Message",
                        timestamp: Date.now(),
                        voiceMessage: {
                            data: audioBuffer, // Store as Buffer
                            duration,
                            mimeType: "audio/ogg", // Ensure MIME type matches frontend
                        },
                    });

                    // Save the chat to MongoDB
                    await newChat.save();

                    // Fetch all messages between the user and receiver
                    const allMessages = transformVoiceMessage(
                        await Chat.find({
                            $or: [
                                { user, receiver },
                                { user: receiver, receiver: user },
                            ],
                        })
                            .sort({ timestamp: 1 })
                            .lean()
                    );

                    // Emit updated messages to both sender and receiver
                    socket.emit("sendMessage", allMessages);
                    io.to(receiver).emit("send", allMessages);
                } catch (err) {
                    console.error("Error saving voice message:", err);
                    socket.emit("error", "Failed to save voice message");
                }
            }
        );

        socket.on("statusUpdate", async ({ status, user }) => {
            const updation = await User.updateOne(
                { username: user },
                { $set: { status: status } }
            );
            console.log("Status Updated: ", updation);
        });
        socket.on("disconnect", () => {
            delete users[socket.id];
            io.emit("newActiveUser", users);
        });
    });
};

module.exports = { setupSocketHandlers };
