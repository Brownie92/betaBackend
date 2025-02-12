const Winner = require("../models/Winner");
const Race = require("../models/Race");
const Vote = require("../models/Vote");
const { getIo, sendWinnerUpdate } = require("../socket"); // ✅ Correcte WebSocket import

/**
 * ✅ Sla de winnaar op zodra de race is afgesloten
 */
const saveWinner = async (raceId) => {
    try {
        const race = await Race.findOne({ raceId });

        if (!race) {
            console.warn(`[WARNING] ❌ Race ${raceId} niet gevonden.`);
            return;
        }

        if (race.status !== "closed") {
            console.warn(`[WARNING] 🚧 Race ${raceId} is nog niet gesloten.`);
            return;
        }

        console.log(`[INFO] 🏆 Race ${raceId} is gesloten, winnaar bepalen...`);

        // ✅ Race als gesloten opslaan
        await Race.findOneAndUpdate({ raceId }, { status: "closed" });

        // ✅ Verstuur raceClosed event **VÓÓR** de winnaar wordt opgeslagen
        const io = getIo();
        io.emit("raceClosed", { raceId, status: "closed" });
        console.log(`[SOCKET] 🔴 raceClosed event verstuurd voor ${raceId}`);

        // ✅ Winnaar bepalen
        const winningMeme = race.memes.reduce((max, meme) =>
            meme.progress > max.progress ? meme : max
        );

        const winner = new Winner({
            raceId: race.raceId,
            memeId: winningMeme.memeId,
            progress: winningMeme.progress,
            votes: 0,
        });

        await winner.save();
        console.log(`[SUCCESS] 🏆 Winnaar opgeslagen: ${winningMeme.memeId}`);

        // ✅ 500ms delay voor WebSocket-update
        setTimeout(() => {
            io.emit("winnerUpdate", winner);
            console.log(`[SOCKET] 🏆 winnerUpdate event verstuurd voor ${raceId}`);
        }, 500);

        return winner;
    } catch (error) {
        console.error(`[ERROR] ❌ Failed to save winner:`, error);
        throw error;
    }
};

/**
 * ✅ Haal de winnaar op voor een race
 */
const getWinnerByRaceId = async (raceId) => {
    try {
        console.log(`[INFO] 🏆 Opvragen winnaar voor race ${raceId}`);

        // ✅ Haal winnaar op en vul meme-informatie aan
        const winner = await Winner.findOne({ raceId }).populate("memeId");

        if (!winner) {
            console.warn(`[WARNING] ❌ Geen winnaar gevonden voor race ${raceId}`);
            return null;
        }

        console.log(`[SUCCESS] 🏆 Winnaar gevonden:`, winner);
        return winner;
    } catch (error) {
        console.error(`[ERROR] ❌ Fout bij ophalen winnaar:`, error);
        throw error;
    }
};

module.exports = { saveWinner, getWinnerByRaceId };