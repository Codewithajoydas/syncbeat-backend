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
const connectDB = require("./config/db.config.js");
const cloudinaryConfig = require("./config/cloudinary.config.js");
const { successResponse } = require("./constants/api-response.js");
const joinRoom = require("./socket/room.js");
cloudinaryConfig();
connectDB();
io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-joined", socket.id);
        console.log(`${socket.id} joined ${roomId}`);
    });

    
    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
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