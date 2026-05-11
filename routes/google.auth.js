require("dotenv").config();

const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const uuid = require("uuid");
const { errorResponse } = require("../constants/api-response");
const destroyCloudinary = require("../utils/destroyCloudinary");
const BASE_URL = "https://rumbling-research-eel.ngrok-free.dev";


router.get("/google", (req, res) => {
    const redirectUri = `${BASE_URL}/auth/google/callback`;

    const authUrl =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=openid email profile` +
        `&access_type=offline` +
        `&prompt=consent`;

    return res.redirect(authUrl);
});

router.get("/google/callback", async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return errorResponse(res, "Authorization code not found", 400);
    }

    try {
        const redirectUri = `${BASE_URL}/auth/google/callback`;
        const params = new URLSearchParams();
        params.append("code", code);
        params.append("client_id", process.env.GOOGLE_CLIENT_ID);
        params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET);
        params.append("redirect_uri", redirectUri);
        params.append("grant_type", "authorization_code");
        const tokenRes = await axios.post(
            "https://oauth2.googleapis.com/token",
            params,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
        const { id_token } = tokenRes.data;
        // Decode payload (for now)
        const payload = JSON.parse(
            Buffer.from(id_token.split(".")[1], "base64").toString()
        );

        const userData = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
        };

        let user = await userModel.findOne({ email: userData.email });

        if (!user) {
            const public_id = `user/${uuid.v4()}`;
            const cloudinaryImage = await uploadToCloudinary(userData.picture, public_id);
            user = await userModel.create({
                email: userData.email,
                name: userData.name,
                isVerified: true,
                provider: "google",
                avatar: cloudinaryImage,
                public_id
            });
        }

        const appToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                provider: "google",
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.redirect(`syncbeat://SignIn?token=${appToken}`);

    } catch (error) {
        console.error(error.response?.data || error.message);
        return errorResponse(res, "Something went wrong", 500);
    }
});

module.exports = router;