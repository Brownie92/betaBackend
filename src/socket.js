const { Server } = require('socket.io');

let io = null; // WebSocket instantie

const initSocket = (server) => {
    if (!server) {
        console.error("[SOCKET] ❌ Kan WebSocket server niet initialiseren: Geen server gevonden.");
        return;
    }

    io = new Server(server, {
        cors: {
            origin: "*", // ⚠️ Beperken in productie!
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`[SOCKET] 🟢 New client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`[SOCKET] 🔴 Client disconnected: ${socket.id}`);
        });
    });

    

    return io;
};

// **WebSocket event functies met checks**
const emitEvent = (eventName, data) => {
    if (!io) {
        console.warn(`[SOCKET] ⚠️ Kan event "${eventName}" niet versturen: WebSocket is niet geïnitialiseerd.`);
        return;
    }
    io.emit(eventName, data);
};

const sendRaceCreated = (race) => emitEvent("raceCreated", race);
const sendRaceUpdate = (race) => emitEvent("raceUpdate", race);
const sendRoundUpdate = (round) => emitEvent("roundUpdate", round);
const sendWinnerUpdate = (winner) => emitEvent("winnerUpdate", winner);
const sendVoteUpdate = (raceId) => {
    if (!io) {
        console.warn("[SOCKET] ⚠️ WebSocket not initialized, cannot send vote update.");
        return;
    }
    io.emit("voteUpdate", { raceId });
};


// **Exports**
module.exports = {
    initSocket,
    sendRaceCreated,
    sendRaceUpdate,
    sendRoundUpdate,
    sendWinnerUpdate,
    sendVoteUpdate
};