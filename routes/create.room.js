const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");

const roomDB = require("../models/rooms.model");
const userDB = require("../models/user.model");

const {
    successResponse,
    errorResponse,
} = require("../constants/api-response");

router.post("/create", async (req, res) => {
    try {
        /*
        =====================================
        AUTHORIZATION HEADER CHECK
        =====================================
        */

        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return errorResponse(res, "Unauthorized", 401);
        }

        /*
        =====================================
        TOKEN EXTRACTION
        =====================================
        */

        const token = authHeader.split(" ")[1];

        /*
        =====================================
        VERIFY TOKEN
        =====================================
        */

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return errorResponse(res, "Invalid or expired token", 401);
        }

        /*
        =====================================
        FIND USER
        =====================================
        */

        const user = await userDB.findById(decoded.id);

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        /*
        =====================================
        REQUEST BODY
        =====================================
        */

        const {
            roomName,
            roomImage = "",
            privacy,
            maxListeners = 10,
        } = req.body;

        /*
        =====================================
        VALIDATIONS
        =====================================
        */

        if (!roomName?.trim()) {
            return errorResponse(res, "Room name is required", 400);
        }

        if (!["public", "private"].includes(privacy)) {
            return errorResponse(
                res,
                "Privacy must be public or private",
                400
            );
        }

        if (
            typeof maxListeners !== "number" ||
            maxListeners < 1
        ) {
            return errorResponse(
                res,
                "Max listeners must be greater than 0",
                400
            );
        }

        /*
        =====================================
        CREATE ROOM
        =====================================
        */

        const roomId = uuid();

        const room = await roomDB.create({
            roomId,
            roomName: roomName.trim(),
            roomImage,
            privacy,
            maxListeners,
            host: user._id,
            roomUsers: [user._id],
        });

        /*
        =====================================
        SUCCESS RESPONSE
        =====================================
        */

        return successResponse(
            res,
            {
                room,
                roomId,
            },
            "Room created successfully",
            201
        );
    } catch (error) {
        console.error("CREATE ROOM ERROR:", error);

        return errorResponse(
            res,
            "Internal server error",
            500
        );
    }
});

module.exports = router;