const { Server } = require("socket.io");

let io = null; // ✅ WebSocket instance

/**
 * Initialize WebSocket server.
 * @param {object} server - HTTP server instance
 */
const initSocket = (server) => {
    if (!server) {
        console.error("[SOCKET] ❌ Cannot initialize WebSocket: No server instance found.");
        return;
    }

    io = new Server(server, {
        cors: {
            origin: "*", // ⚠️ Restrict this in production!
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`[SOCKET] 🟢 New client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`[SOCKET] 🔴 Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

/**
 * Retrieve the WebSocket instance.
 * @returns {object} WebSocket instance (`io`)
 * @throws Error if WebSocket is not initialized
 */
const getIo = () => {
    if (!io) {
        throw new Error("[SOCKET] ❌ WebSocket is not initialized!");
    }
    return io;
};

/**
 * Emit a WebSocket event with data.
 * @param {string} eventName - Event name
 * @param {object} data - Event payload
 */
const emitEvent = (eventName, data) => {
    if (!io) {
        console.warn(`[SOCKET] ⚠️ Cannot send event "${eventName}": WebSocket is not initialized.`);
        return;
    }
    io.emit(eventName, data);
};

// **WebSocket event emitters**
const sendRaceCreated = (race) => emitEvent("raceCreated", race);
const sendRaceUpdate = (race) => emitEvent("raceUpdate", race);
const sendRoundUpdate = (round) => emitEvent("roundUpdate", round);
const sendWinnerUpdate = (winner) => emitEvent("winnerUpdate", winner);
const sendVoteUpdate = (raceId) => emitEvent("voteUpdate", { raceId });
const sendRaceClosed = (race) => emitEvent("raceClosed", race);

// **Exports**
module.exports = {
    initSocket,
    getIo,
    sendRaceCreated,
    sendRaceUpdate,
    sendRaceClosed,
    sendRoundUpdate,
    sendWinnerUpdate,
    sendVoteUpdate,
};