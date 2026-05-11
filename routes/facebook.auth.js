const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { errorResponse, successResponse } = require("../constants/api-response");
const userModel = require("../models/user.model");
const axios = require("axios");
const BASE_URL = "https://rumbling-research-eel.ngrok-free.dev";
const uploadToCloudinary = require("../utils/uploadToCloudinary");

console.log("This is the id", process.env.FACEBOOK_CLIENT_ID);
console.log("This is the secret", process.env.FACEBOOK_CLIENT_SECRET);

const uuid = require("uuid");
router.get("/facebook", async (req, res) => {

    const redirectURI =
        `${BASE_URL}/auth/facebook/callback`;

    const authURL =
        "https://www.facebook.com/dialog/oauth" +
        `?client_id=${process.env.FACEBOOK_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectURI)}` +
        `&response_type=code` +
        `&scope=email`;

    return res.redirect(authURL);
});

router.get("/facebook/callback", async (req, res) => {

    const code = req.query.code;

    if (!code) {
        return errorResponse(
            res,
            "Authorization code not found",
            400
        );
    }

    try {

        const tokenResponse = await axios.get(
            "https://graph.facebook.com/oauth/access_token",
            {
                params: {
                    client_id:
                        process.env.FACEBOOK_CLIENT_ID,

                    client_secret:
                        process.env.FACEBOOK_CLIENT_SECRET,

                    redirect_uri:
                        `${BASE_URL}/auth/facebook/callback`,

                    code,
                },
            }
        );

        const accessToken =
            tokenResponse.data.access_token;

        const userData = await axios.get(
            "https://graph.facebook.com/me",
            {
                params: {
                    fields:
                        "id,name,email,picture",

                    access_token: accessToken,
                },
            }
        );
        console.log(userData.data);
        let user = await userModel.findOne({
            email: userData.data.email,
        });

        if (!user) {

            const public_id =
                `user/${uuid.v4()}`;

            const imageURL =
                userData.data.picture.data.url;

            const cloudinaryImage =
                await uploadToCloudinary(
                    imageURL,
                    public_id
                );

            user = await userModel.create({
                email: userData.data.email,
                name: userData.data.name,
                isVerified: true,
                provider: "facebook",
                avatar: cloudinaryImage,
                public_id,
            });
        }

        const appToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                provider: "facebook",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.redirect(
            `syncbeat://SignIn?token=${appToken}`
        );

    } catch (error) {

        console.log(
            error.response?.data || error.message
        );

        return errorResponse(
            res,
            "Something went wrong",
            500
        );
    }
});

module.exports = router;