require("dotenv").config();
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { mongoURI, PORT } = require("./config");
const { setupSocketHandlers } = require("./sockets");

mongoose.connect(mongoURI);

const io = new Server({
    cors: {
        origin: "https://moonscape-kappa.vercel.app/",
    },
});

setupSocketHandlers(io);

io.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
