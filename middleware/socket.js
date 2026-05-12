const jwt = require("jsonwebtoken");

const socketAuthMiddleware = (socket, next) => {
    try {
        const authToken = socket.handshake.auth.token;
        if (!authToken) {
            return next(new Error("Unauthorized"));
        }
        const decodedToken = jwt.verify(
            authToken,
            process.env.JWT_SECRET
        );
        socket.user = decodedToken;
        next();
    } catch (err) {
        next(new Error("Invalid Token"));
    }
};
module.exports = socketAuthMiddleware;