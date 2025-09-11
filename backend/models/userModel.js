const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String },
    status: {
        type: String,
        default: "Whatever happens happens with truth",
    },
});
const User = mongoose.model("user", Schema);
module.exports = { User };
