const calculateProgressAndBoost = (memes, votes) => {
    console.log('[DEBUG] calculateProgressAndBoost called with memes:', JSON.stringify(memes, null, 2));
    console.log('[DEBUG] Received votes:', JSON.stringify(votes, null, 2));

    // ✅ 1️⃣ Stemmen tellen per meme
    const voteCounts = {};
    votes.forEach(vote => {
        const memeId = vote.memeId.toString();
        voteCounts[memeId] = (voteCounts[memeId] || 0) + 1;
    });

    console.log('[DEBUG] Vote counts per meme:', JSON.stringify(voteCounts, null, 2));

    // ✅ 2️⃣ Bepaal de meme met de meeste stemmen
    let mostVotedMeme = { memeId: null, votes: 0 };
    Object.entries(voteCounts).forEach(([memeId, count]) => {
        if (count > mostVotedMeme.votes) {
            mostVotedMeme = { memeId, votes: count };
        }
    });

    console.log(`[DEBUG] Most voted meme: ${mostVotedMeme.memeId} with ${mostVotedMeme.votes} votes`);

    // ✅ 3️⃣ Bereken de voortgang en boosts
    const roundLog = {
        progress: [],
        votes: [],
        winner: null
    };

    const updatedMemes = memes.map((meme) => {
        console.log(`[DEBUG] Processing meme: ${meme.name} (ID: ${meme.memeId})`);

        // ✅ Willekeurige progressie tussen 5-10
        const randomProgress = Math.floor(Math.random() * 6) + 5;
        let progressGain = randomProgress;
        let boosted = false;
        let boostAmount = 0;

        // ✅ 4️⃣ Controleer of deze meme de meeste stemmen had
        console.log(`[DEBUG] Comparing meme.memeId (${meme.memeId}) with mostVotedMeme.memeId (${mostVotedMeme.memeId})`);
        
        if (meme.memeId.toString() === mostVotedMeme.memeId) {
            boosted = true;
            boostAmount = Math.floor(progressGain * 0.3);
            progressGain += boostAmount;
            console.log(`[DEBUG] Boost applied to ${meme.name}: +${boostAmount} (Total: ${progressGain})`);
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

    console.log('[DEBUG] roundLog.progress:', JSON.stringify(roundLog.progress, null, 2));
    console.log('[DEBUG] roundLog.votes:', JSON.stringify(roundLog.votes, null, 2));

    // ✅ 6️⃣ Bepaal de winnaar van deze ronde
    const roundWinner = roundLog.progress.reduce((max, item) => (item.progress > max.progress ? item : max), { memeId: null, progress: 0 });
    roundLog.winner = roundWinner.memeId;

    console.log(`[DEBUG] Round winner: ${roundLog.winner}`);
    console.log('[DEBUG] Final Round Log:', JSON.stringify(roundLog, null, 2));

    return { updatedMemes, roundLog };
};

module.exports = { calculateProgressAndBoost };