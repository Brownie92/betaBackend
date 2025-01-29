const Race = require('../models/Race');
const Meme = require('../models/Meme');

const createRace = async () => {
    const raceId = `race${Date.now()}`;

    try {
        // ✅ Controleer of er genoeg memes zijn
        const totalMemes = await Meme.countDocuments();
        if (totalMemes < 6) {
            throw new Error('Not enough memes in the database to start a race');
        }

        // ✅ Haal 6 willekeurige memes op
        const randomMemes = totalMemes === 6
            ? await Meme.find().limit(6)
            : await Meme.aggregate([{ $sample: { size: 6 } }]);

        // ✅ Maak een nieuwe race aan
        const newRace = new Race({
            raceId,
            memes: randomMemes.map(meme => ({
                memeId: meme.memeId.toString(),
                name: meme.name,
                url: meme.url,
                votes: 0,
                progress: 0,
            })),
            currentRound: 1,
            roundEndTime: new Date(Date.now() + 3 * 60 * 1000),
        });

        // ✅ Sla de race op
        await newRace.save();
        return newRace;
    } catch (error) {
        throw error;
    }
};

const getRaceById = async (raceId) => {
    return await Race.findOne({ raceId });
};

const updateRaceStatus = async (raceId, status) => {
    return await Race.findOneAndUpdate({ raceId }, { status }, { new: true });
};

module.exports = { createRace, getRaceById, updateRaceStatus };