const express = require("express");
const router = express.Router();
const userModel = require("../models/user.model");
const { errorResponse, successResponse } = require("../constants/api-response");
const connectRedis = require("../config/redis.config");
const sendOTP = require("../utils/sendMail");
const generateOTP = require("../utils/generateOTP");


router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {

        const redis = await connectRedis();
        const existingUser = await userModel.findOne({ email });
        if (!existingUser) {
            return errorResponse(res, "User does not exist", 404);
        }
        const existingOTP = await redis.get(`otp:${email}`);
        if (existingOTP) {
            return errorResponse(res, "OTP already sent. Use it within 5 minutes", 429);
        }
        const otp = generateOTP();
        const OTP_EXPIRY = 300;
        const expiresAt = Date.now() + OTP_EXPIRY * 1000;
        await redis.set(`otp:${email}`, otp, {
            EX: OTP_EXPIRY,
        });
        await sendOTP(email, otp);
        return successResponse(res, expiresAt, "OTP sent successfully", 200);

    } catch (error) {
        console.log(error.message);
        return errorResponse(res, error.message, 500);
    }
});

router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    try {
        const redis = await connectRedis();
        const existingOTP = await redis.get(`otp:${email}`);
        if (!existingOTP) {
            return errorResponse(res, "OTP not found", 404);
        }
        if (existingOTP !== otp) {
            return errorResponse(res, "Invalid OTP", 401);
        }
        await redis.del(`otp:${email}`);
        await redis.set(`otp_verified:${email}`, "true", {
            EX: 300,
        });
        return successResponse(res, null, "OTP verified successfully", 200);
    } catch (error) {
        console.log(error.message);
        return errorResponse(res, error.message, 500);
    }
});


router.post("/reset-password", async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return errorResponse(res, "All fields are required", 400);
        }

        const redis = await connectRedis();

        const verified = await redis.get(`otp_verified:${email}`);

        if (verified !== "true") {
            return errorResponse(
                res,
                "OTP verification required",
                401
            );
        }

        const existingUser = await userModel.findOne({ email });

        if (!existingUser) {
            return errorResponse(res, "User does not exist", 404);
        }



        existingUser.password = password;

        await existingUser.save();

        await redis.del(`otp_verified:${email}`);

        return successResponse(
            res,
            null,
            "Password reset successfully",
            200
        );
    } catch (error) {
        console.log(error.message);

        return errorResponse(res, error.message, 500);
    }
});



module.exports = router;