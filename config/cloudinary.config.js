const cloudinary = require("cloudinary").v2;
const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

const connectToCloudinary = async () => {
    try {
        await cloudinary.config({
            cloud_name: CLOUD_NAME,
            api_key: API_KEY,
            api_secret: API_SECRET,
            secure: true,
        });
        console.log("Cloudinary connected");
    } catch (error) {
        console.log("Error connecting to Cloudinary", error);
    }
};

module.exports = connectToCloudinary;