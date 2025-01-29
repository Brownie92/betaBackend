const calculateProgressAndBoost = (memes, votes) => {
    // ✅ 1️⃣ Stemmen tellen per meme
    const voteCounts = {};
    votes.forEach(vote => {
        const memeId = vote.memeId.toString();
        voteCounts[memeId] = (voteCounts[memeId] || 0) + 1;
    });

    // ✅ 2️⃣ Bepaal de meme met de meeste stemmen
    let mostVotedMeme = { memeId: null, votes: 0 };
    Object.entries(voteCounts).forEach(([memeId, count]) => {
        if (count > mostVotedMeme.votes) {
            mostVotedMeme = { memeId, votes: count };
        }
    });

    // ✅ 3️⃣ Bereken de voortgang en boosts
    const roundLog = {
        progress: [],
        votes: [],
        winner: null
    };

    const updatedMemes = memes.map((meme) => {
        // ✅ Willekeurige progressie tussen 5-10
        const randomProgress = Math.floor(Math.random() * 6) + 5;
        let progressGain = randomProgress;
        let boosted = false;
        let boostAmount = 0;

        // ✅ 4️⃣ Controleer of deze meme de meeste stemmen had
        if (meme.memeId.toString() === mostVotedMeme.memeId) {
            boosted = true;
            boostAmount = Math.floor(progressGain * 0.3);
            progressGain += boostAmount;
        }

        // ✅ 5️⃣ Resultaten toevoegen aan het ronde-log
        roundLog.progress.push({
            memeId: meme.memeId,
            progress: progressGain,
            boosted,
            boostAmount
        });

        roundLog.votes.push({
            memeId: meme.memeId,
            votes: voteCounts[meme.memeId.toString()] || 0
        });

        return {
            ...meme,
            progress: meme.progress + progressGain,
            votes: 0 // Reset stemmen
        };
    });

    // ✅ 6️⃣ Bepaal de winnaar van deze ronde
    const roundWinner = roundLog.progress.reduce((max, item) => (item.progress > max.progress ? item : max), { memeId: null, progress: 0 });
    roundLog.winner = roundWinner.memeId;

    return { updatedMemes, roundLog };
};

module.exports = { calculateProgressAndBoost };