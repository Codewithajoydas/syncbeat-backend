const cloudinary = require("cloudinary").v2;

const destroyCloudinary = async (public_id) => {
    const result = await cloudinary.uploader.destroy(public_id);

    return result.secure_url;
};

module.exports = destroyCloudinary;

