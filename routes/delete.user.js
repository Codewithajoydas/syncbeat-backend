

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { errorResponse, successResponse } = require("../constants/api-response");
const userModel = require("../models/user.model");
const axios = require("axios");
const BASE_URL = "https://rumbling-research-eel.ngrok-free.dev";

router.delete("/delete", async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await userModel.findOne({ email });
        if (!existingUser) {
            return errorResponse(res, "User does not exist", 404);
        }
        await userModel.deleteOne({ email });
        return successResponse(res, null, "User deleted successfully", 200);
    } catch (error) {
        console.log(error.message);
        return errorResponse(res, error.message, 500);
    }
})

module.exports = router;