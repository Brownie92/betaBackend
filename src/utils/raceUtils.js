const calculateProgressAndBoost = (memes, votes) => {
    console.log('[DEBUG] calculateProgressAndBoost called with memes:', JSON.stringify(memes, null, 2));
    console.log('[DEBUG] Received votes:', JSON.stringify(votes, null, 2));

    // **1️⃣ Bereken stemtotalen per meme**
    const voteCounts = {};
    votes.forEach(vote => {
        if (!voteCounts[vote.memeId.toString()]) {
            voteCounts[vote.memeId.toString()] = 0;
        }
        voteCounts[vote.memeId.toString()] += 1;
    });

    console.log('[DEBUG] Vote counts per meme:', JSON.stringify(voteCounts, null, 2));

    // **2️⃣ Bepaal de meme met de meeste stemmen**
    let mostVotedMeme = { memeId: null, votes: 0 };
    Object.keys(voteCounts).forEach(memeId => {
        if (voteCounts[memeId] > mostVotedMeme.votes) {
            mostVotedMeme = { memeId, votes: voteCounts[memeId] };
        }
    });

    console.log(`[DEBUG] Most voted meme: ${mostVotedMeme.memeId} with ${mostVotedMeme.votes} votes`);

    const roundLog = {
        progress: [],
        votes: [],
        winner: null, // Wordt later ingevuld
    };

    // **3️⃣ Bereken de progressie per meme**
    const updatedMemes = memes.map((meme) => {
        console.log(`[DEBUG] Processing meme: ${meme.name} (ID: ${meme._id})`);

        // Willekeurige voortgang tussen 5-10
        const randomProgress = Math.floor(Math.random() * 6) + 5;
        let progress = meme.progress + randomProgress;

        console.log(`[DEBUG] Initial progress for ${meme.name}: ${meme.progress}, after random addition: ${progress}`);

        let boosted = false;
        let boostAmount = 0;

        // **Extra logging om vergelijking te checken**
        console.log(`[DEBUG] Comparing meme._id (${meme._id.toString()}) with mostVotedMeme.memeId (${mostVotedMeme.memeId})`);

        // **4️⃣ Toepassen van de boost als de meme de meeste stemmen heeft**
        if (meme._id.toString() === mostVotedMeme.memeId?.toString()) {
            boosted = true;
            boostAmount = Math.floor(progress * 0.3);
            progress += boostAmount;

            console.log(`[DEBUG] Boost applied to ${meme.name}: +${boostAmount} (Total: ${progress})`);
        }

        // **5️⃣ Voeg progressie en stemmen toe aan het ronde-log**
        roundLog.progress.push({
            memeId: meme._id,
            progress: randomProgress,
            boosted,
            boostAmount
        });

        roundLog.votes.push({
            memeId: meme._id,
            votes: voteCounts[meme._id.toString()] || 0
        });

        return {
            ...meme,
            progress,
            votes: 0, // Reset stemmen voor de volgende ronde
        };
    });

    console.log('[DEBUG] roundLog.progress:', JSON.stringify(roundLog.progress, null, 2));
    console.log('[DEBUG] roundLog.votes:', JSON.stringify(roundLog.votes, null, 2));

    // **6️⃣ Bepaal de winnaar van deze ronde**
    const roundWinner = roundLog.progress.reduce((max, item) => {
        return item.progress > max.progress ? item : max;
    }, { memeId: null, progress: 0 });

    roundLog.winner = roundWinner.memeId;

    console.log(`[DEBUG] Round winner: ${roundLog.winner}`);

    // **7️⃣ Laatste controle voordat we het terugsturen**
    console.log('[DEBUG] Final Round Log:', JSON.stringify(roundLog, null, 2));

    return { updatedMemes, roundLog };
};

module.exports = { calculateProgressAndBoost };