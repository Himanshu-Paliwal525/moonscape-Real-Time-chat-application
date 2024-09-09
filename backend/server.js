const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { mongoURI, PORT } = require("./config");
const { setupSocketHandlers } = require(".");

mongoose.connect(mongoURI);

const io = new Server({
    cors: {
        origin: "http://localhost:3000",
    },
});

setupSocketHandlers(io);

io.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
