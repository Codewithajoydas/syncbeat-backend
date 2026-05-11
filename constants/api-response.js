const STATUS = {
    SUCCESS: "success",
    FAIL: "fail",
    ERROR: "error",
};

/**
 * Send success API response
 *
 * @param {import("express").Response} res - Express response object
 * @param {Object|Array} [data={}] - Response data
 * @param {string} [message="Success"] - Response message
 * @param {number} [statusCode=200] - HTTP status code
 *
 * @returns {import("express").Response}
 */

const successResponse = (res, data = {}, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
        status: STATUS.SUCCESS,
        message,
        data,
    });
};

/**
 * Send success API response
 *
 * @param {import("express").Response} res - Express response object
 * @param {string} [message="Success"] - Response message
 * @param {number} [statusCode=200] - HTTP status code
 *
 * @returns {import("express").Response}
 */

const errorResponse = (res, message = "Something went wrong", statusCode = 500) => {
    return res.status(statusCode).json({
        status: STATUS.ERROR,
        message,
        data: null,
    });
};

module.exports = {
    successResponse,
    errorResponse,
    STATUS,
};