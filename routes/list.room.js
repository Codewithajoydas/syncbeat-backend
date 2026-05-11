const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const roomDB = require("../models/rooms.model");
const userDB = require("../models/user.model");
const {
    successResponse,
    errorResponse,
} = require("../constants/api-response");

router.get("/list", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return errorResponse(res, "Unauthorized", 401);
        }
        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        } catch (error) {
            return errorResponse(
                res,
                "Invalid or expired token",
                401
            );
        }
        const user = await userDB.findById(decodedToken.id);

        if (!user) {
            return errorResponse(
                res,
                "User does not exist",
                404
            );
        }

        const rooms = await roomDB
            .find({
                roomUsers: user._id,
                isDeleted: false
            }).populate("host").limit(5)
            .sort({ createdAt: -1 });


        return successResponse(
            res,
            {
                count: rooms.length,
                rooms,
            },
            "Rooms fetched successfully",
            200
        );
    } catch (error) {
        console.error("ROOM LIST ERROR:", error);

        return errorResponse(
            res,
            "Internal server error",
            500
        );
    }
});

module.exports = router;