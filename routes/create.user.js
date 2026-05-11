const express = require("express");
const userModel = require("../models/user.model");
const { successResponse, errorResponse } = require("../constants/api-response");
const router = express.Router();

router.post("/create", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return errorResponse(res, "All fields are required, name, email and password", 400);
        }
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return errorResponse(res, "User already exists, use another email", 400);
        }
        const user = await userModel.create(req.body);
        return successResponse(res, user, "User created successfully, now sign in", 201);
    } catch (error) {
        console.log(error.message);
        return errorResponse(res, error.message, 500);
    }
})

module.exports = router;