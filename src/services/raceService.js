const Race = require('../models/Race');
const Meme = require('../models/Meme');

const createRace = async () => {
    const raceId = `race${Date.now()}`;
    console.log(`[DEBUG] 🏁 Creating new race: ${raceId}`);

    try {
        // ✅ 1️⃣ Controleer eerst hoeveel memes er zijn
        const totalMemes = await Meme.countDocuments();
        console.log(`[DEBUG] 📊 Total memes in database: ${totalMemes}`);

        if (totalMemes < 6) {
            console.error(`[ERROR] ❌ Not enough memes in the database! Found: ${totalMemes}`);
            throw new Error('Not enough memes in the database to start a race');
        }

        // ✅ 2️⃣ Haal 6 willekeurige memes op
        let randomMemes;
        if (totalMemes === 6) {
            // Als er precies 6 memes zijn, haal dan gewoon de eerste 6 op
            randomMemes = await Meme.find().limit(6);
        } else {
            // Anders gebruik je de willekeurige selectie via $sample
            randomMemes = await Meme.aggregate([{ $sample: { size: 6 } }]);
        }

        console.log(`[DEBUG] ✅ Retrieved ${randomMemes.length} memes for race.`);

        // ✅ 3️⃣ Maak een nieuwe race aan
        const newRace = new Race({
            raceId,
            memes: randomMemes.map(meme => ({
                memeId: meme.memeId.toString(), // ✅ Correcte memeId gebruiken
                name: meme.name,
                url: meme.url,
                votes: 0,
                progress: 0,
            })),
            currentRound: 1,
            roundEndTime: new Date(Date.now() + 3 * 60 * 1000), // Ronde duurt 3 minuten
        });

        console.log(`[DEBUG] 🔄 New race object created:`, JSON.stringify(newRace, null, 2));

        // ✅ 4️⃣ Sla de race op
        await newRace.save();
        console.log(`[DEBUG] ✅ Race ${raceId} successfully saved!`);

        return newRace;
    } catch (error) {
        console.error(`[ERROR] ❌ Failed to create race:`, error);
        throw error;
    }
};

const getRaceById = async (raceId) => {
    console.log(`[DEBUG] Fetching race with ID: ${raceId}`);
    const race = await Race.findOne({ raceId });
    console.log(`[DEBUG] Retrieved race:`, JSON.stringify(race, null, 2));
    return race;
};

const updateRaceStatus = async (raceId, status) => {
    console.log(`[DEBUG] Updating race ${raceId} to status: ${status}`);
    const updatedRace = await Race.findOneAndUpdate({ raceId }, { status }, { new: true });
    console.log(`[DEBUG] Updated race:`, JSON.stringify(updatedRace, null, 2));
    return updatedRace;
};

module.exports = { createRace, getRaceById, updateRaceStatus };