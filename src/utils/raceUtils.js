const calculateProgressAndBoost = (memes, votes) => {
    // ✅ 1️⃣ Count votes per meme
    const voteCounts = {};
    votes.forEach(vote => {
        const memeId = vote.memeId.toString();
        voteCounts[memeId] = (voteCounts[memeId] || 0) + 1;
    });

    // ✅ 2️⃣ Sort memes based on vote count (higher votes first)
    const sortedMemes = [...memes].sort((a, b) => 
        (voteCounts[b.memeId.toString()] || 0) - (voteCounts[a.memeId.toString()] || 0)
    );

    // ✅ 3️⃣ Define boost percentages for the top 3 memes
    const boostRanges = {
        1: [35, 50], // 🥇 Rank 1 gets a 35% - 50% boost
        2: [15, 25], // 🥈 Rank 2 gets a 15% - 25% boost
        3: [5, 10]   // 🥉 Rank 3 gets a 5% - 10% boost
    };

    const roundLog = {
        progress: [],
        votes: [],
        winner: null
    };

    const updatedMemes = sortedMemes.map((meme, index) => {
        // ✅ Random base progress (50 - 100)
        const baseProgress = Math.floor(Math.random() * 51) + 50;

        let boosted = false;
        let boostAmount = 0;

        // ✅ 4️⃣ Only top 3 memes receive a boost
        if (index < 3 && voteCounts[meme.memeId.toString()] > 0) {
            boosted = true;
            const [minBoost, maxBoost] = boostRanges[index + 1]; // Retrieve the correct boost range
            const boostPercentage = Math.random() * (maxBoost - minBoost) + minBoost;
            boostAmount = Math.floor((boostPercentage / 100) * 100); // Boost based on 100 points
        }

        const totalProgress = baseProgress + boostAmount;

        // ✅ 5️⃣ Log round progress per meme
        roundLog.progress.push({
            memeId: meme.memeId,
            progress: totalProgress, 
            baseProgress,
            boosted,
            boostAmount
        });

        roundLog.votes.push({
            memeId: meme.memeId,
            votes: voteCounts[meme.memeId.toString()] || 0
        });

        return {
            ...meme,
            progress: (meme.progress || 0) + totalProgress // ✅ Ensures progress is never undefined
        };
    });

    // ✅ 6️⃣ Determine the round winner (highest progress)
    const roundWinner = roundLog.progress.reduce((max, item) => 
        item.progress > max.progress ? item : max, { memeId: null, progress: 0 }
    );
    roundLog.winner = roundWinner.memeId;

    return { updatedMemes, roundLog };
};

module.exports = { calculateProgressAndBoost };