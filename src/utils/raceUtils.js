const calculateProgressAndBoost = (memes, votes) => {
    // ✅ 1️⃣ Stemmen tellen per meme
    const voteCounts = {};
    votes.forEach(vote => {
        const memeId = vote.memeId.toString();
        voteCounts[memeId] = (voteCounts[memeId] || 0) + 1;
    });

    // ✅ 2️⃣ Sorteer memes op aantal stemmen (backing)
    const sortedMemes = [...memes].sort((a, b) => 
        (voteCounts[b.memeId.toString()] || 0) - (voteCounts[a.memeId.toString()] || 0)
    );

    // ✅ 3️⃣ Bepaal de boost-verdeling
    const boostRanges = {
        1: [35, 50], // 🥇 Nummer 1 krijgt 35 - 50% boost van 100
        2: [15, 25], // 🥈 Nummer 2 krijgt 15 - 25% boost van 100
        3: [5, 10]   // 🥉 Nummer 3 krijgt 5 - 10% boost van 100
    };

    const roundLog = {
        progress: [],
        votes: [],
        winner: null
    };

    const updatedMemes = sortedMemes.map((meme, index) => {
        // ✅ Willekeurige basisprogressie (50 - 100)
        const baseProgress = Math.floor(Math.random() * 51) + 50;

        let boosted = false;
        let boostAmount = 0;

        // ✅ 4️⃣ Alleen top 3 memes krijgen een boost
        if (index < 3 && voteCounts[meme.memeId.toString()] > 0) {
            boosted = true;
            const [minBoost, maxBoost] = boostRanges[index + 1]; // Haal juiste range op
            const boostPercentage = Math.random() * (maxBoost - minBoost) + minBoost;
            boostAmount = Math.floor((boostPercentage / 100) * 100); // Boost over 100 punten
        }

        const totalProgress = baseProgress + boostAmount;

        // ✅ 5️⃣ Log resultaat per meme
        roundLog.progress.push({
            memeId: meme.memeId,
            progress: totalProgress, // ✅ Zorgt ervoor dat progress ALTIJD correct wordt opgeslagen
            baseProgress,
            boosted,
            boostAmount
        });

        roundLog.votes.push({
            memeId: meme.memeId,
            votes: voteCounts[meme.memeId.toString()] || 0
        });

        console.log(`✅ Meme ${meme.memeId}: baseProgress=${baseProgress}, boost=${boostAmount}, totalProgress=${totalProgress}`);

        return {
            ...meme,
            progress: (meme.progress || 0) + totalProgress // ✅ Voorkomt dat progress `undefined` is
        };
    });

    // ✅ 6️⃣ Bepaal de winnaar van deze ronde (hoogste totale progressie)
    const roundWinner = roundLog.progress.reduce((max, item) => 
        item.progress > max.progress ? item : max, { memeId: null, progress: 0 }
    );
    roundLog.winner = roundWinner.memeId;

    console.log("✅ Round Log:", JSON.stringify(roundLog, null, 2));

    return { updatedMemes, roundLog };
};

module.exports = { calculateProgressAndBoost };