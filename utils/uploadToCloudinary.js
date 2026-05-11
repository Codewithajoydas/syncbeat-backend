const cloudinary = require("cloudinary").v2;

const uploadToCloudinary = async (file, public_id) => {
    const result = await cloudinary.uploader.upload(file, {
        folder: "Syncbeat",
        public_id: public_id,

    });

    return result.secure_url;
};

module.exports = uploadToCloudinary;

