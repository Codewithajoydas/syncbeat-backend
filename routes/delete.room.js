

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const roomDB = require("../models/rooms.model");
const userDB = require("../models/user.model");
const {
    successResponse,
    errorResponse,
} = require("../constants/api-response");
const { default: mongoose } = require("mongoose");

router.post("/delete", async (req, res) => {
    const roomId = req.body.roomId;
    if(!roomId) return errorResponse(res, "Room id is required", 400);
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
        const deleteRoom = await roomDB.findByIdAndUpdate(roomId, {
            isDeleted: true
        }, { new: true });
        return successResponse(
            res,
            null,
            "Rooms Deleted successfully",
            200
        );
    } catch (error) {
        console.error("DELETE ROOM ERROR:", error);
        return errorResponse(
            res,
            "Internal server error",
            500
        );
    }
});

module.exports = router;