const mongoose = require("mongoose");

const User = mongoose.model("user", {
    username: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String },
});

module.exports = {User};
