const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        artist: {
            type: String,
            required: true,
        },

        album: {
            type: String,
        },

        coverImage: {
            type: String,
        },

        songUrl: {
            type: String,
            required: true,
        },

        duration: {
            type: Number,
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "Users",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Song",
    songSchema
);