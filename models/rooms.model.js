const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,
        },
        roomName: {
            type: String,
            required: true,
        },
        roomImage: {
            type: String,
        },
        currentSong: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
            default: null,
        },
        roomUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        privacy: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },
        maxListeners: {
            type: Number,
            default: 10,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Room",
    roomSchema
);