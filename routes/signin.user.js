const express = require("express");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { successResponse, errorResponse } = require("../constants/api-response");
const router = express.Router();

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return errorResponse(res, "All fields are required", 400);
        }
        const existingUser = await userModel.findOne({ email }).select("+password");
        if (!existingUser) {
            return errorResponse(res, "User does not exist", 404);
        }
        const isPasswordValid = await existingUser.comparePassword(password);
        if (!isPasswordValid) {
            return errorResponse(res,"Invalid password", 401);
        }
        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        return successResponse(res, [{ token, user: existingUser }], "User signed in successfully", 200);

    } catch (error) {
        console.log(error.message);
        return errorResponse(res, error.message, 500);
    }
})

module.exports = router;