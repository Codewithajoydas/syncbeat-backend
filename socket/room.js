 const joinRoom = (socket, roomId, io) => {
    socket.join(roomId);
    console.log(`${socket.id} joined ${roomId}`);
    io.to(roomId).emit("user-joined", {
        userId: socket.id,
        roomId,
    });
}

module.exports = joinRoom