const express = require("express");
const app = express();
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const { initSocket } = require("./socket/index.js");
const io = initSocket(server);
app.use(express.json());
const env = process.env.NODE_ENV || "development";
dotenv.config({
    path: `.env.${env}`,
});
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db.config.js");
const cloudinaryConfig = require("./config/cloudinary.config.js");
const { successResponse } = require("./constants/api-response.js");
const joinRoom = require("./socket/room.js");
const activeUsersDB = require("./models/activeUsers.js");
const socketAuthMiddleware = require("./middleware/socket.js");
const logger = require("./utils/logger.js");
const playSong = require("./socket/playSong.js");
cloudinaryConfig();
connectDB();
io.use(socketAuthMiddleware);
io.on("connection", (socket) => {
    socket.on("join-room", async (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-joined", socket.user.id);
        logger.info(`User id is ${socket.user.id} and room id is ${roomId}`);
        try {
            await activeUsersDB.findOneAndUpdate(
                {
                    userId: socket.user.id,
                    roomId
                },
                {
                    socketId: socket.id
                },
                {
                    upsert: true,
                    new: true
                }
            );
            const totalUser = io.sockets.adapter.rooms.get(roomId)?.size
            io.to(roomId).emit("room-user-count", totalUser);
        } catch (error) {
            logger.error(error);
        }

    });
    socket.on("play-song", (data) => {
        playSong(io, socket, data.roomId, data);
    });
    socket.on("disconnect", async () => {
        try {
            const findRoom = await activeUsersDB.findOne({ socketId: socket.id });
            const roomId = findRoom.roomId;
            await activeUsersDB.deleteOne({ socketId: socket.id });
            const totalUser = io.sockets.adapter.rooms.get(roomId)?.size;
            io.to(roomId).emit("room-user-count", totalUser);
            logger.info(`User id is ${socket.user.id} disconnected from room`);
        } catch (error) {
            logger.error(error);
        }

    });
});
app.use("/users", require("./routes/create.user.js"));
app.use("/users", require("./routes/signin.user.js"));
app.use("/auth", require("./routes/google.auth.js"));
app.use("/auth", require("./routes/forgot.auth.js"));
app.use("/auth", require("./routes/facebook.auth.js"));
app.use("/users", require("./routes/delete.user.js"));
app.use("/rooms", require("./routes/create.room.js"));
app.use("/rooms", require("./routes/delete.room.js"));
app.use("/rooms", require("./routes/list.room.js"));
app.get("/", (req, res) => {
    return successResponse(
        res,
        null,
        "Welcome to Syncbeat API",
        200
    );
});

server.listen(process.env.PORT, () => {
    console.log(
        `Server is running on port ${process.env.PORT} in ${env} mode`
    );
});