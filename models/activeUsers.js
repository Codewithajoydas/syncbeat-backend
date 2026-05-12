const mongoose = require("mongoose");

const ActiveUserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: "User",
    },
    socketId: {
        type: String,
        required: true,
    },
    roomId: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("ActiveUser", ActiveUserSchema);