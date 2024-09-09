module.exports = {
    SECRET_KEY: "moonscape_chat_key",
    PORT: process.env.PORT || 5000,
    mongoURI: process.env.MONGODB_URI || "mongodb://localhost:27017/chat-app"
};
