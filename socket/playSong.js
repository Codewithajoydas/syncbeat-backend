const logger = require("../utils/logger");

/**
 * Handles synchronized song playback for all users inside a room.
 *
 * This function is responsible for:
 * - Receiving play events from a client
 * - Broadcasting the playback state to all users in the room
 * - Keeping song playback synchronized between connected users
 *
 * Typical use cases:
 * - Sync music playback in real-time
 * - Group listening sessions
 * - Shared music rooms
 *
 * @function playSong
 *
 * @param {require("socket.io").Server} io
 * Socket.IO server instance used to emit events globally or to specific rooms.
 *
 * @param {require("socket.io").Socket} socket
 * Current connected client socket instance.
 *
 * @param {string} roomId
 * Unique room identifier where the song should be played/synchronized.
 *
 * @returns {void}
 *
 * @example
 * playSong(io, socket, "room-123");
 */
const playSong = (io, socket, roomId, data) => {
    logger.info(`Received play event from ${socket.id}`);
    socket.to(roomId).emit("playing-song", {
        message: data.message
    });
};

module.exports = playSong;