const calculateProgressAndBoost = (memes, raceEndTime) => {
  console.log('[DEBUG] calculateProgressAndBoost called with memes:', JSON.stringify(memes, null, 2));

  // Controleer of de race nog actief is
  const now = new Date();
  if (raceEndTime && now > raceEndTime) {
    console.log(`[DEBUG] Race time has expired. Current time: ${now}, Race end time: ${raceEndTime}`);
    return { updatedMemes: memes, roundLog: { progress: [], votes: [], winner: null } };
  }

  console.log(`[DEBUG] Race is still active. Current time: ${now}, Race end time: ${raceEndTime}`);

  // Vind de meest gestemde meme
  const mostVotedMeme = memes.reduce(
    (max, meme) => {
      console.log(`[DEBUG] Comparing votes: current max = ${max.votes || 0}, meme = ${meme.votes}`);
      return meme.votes > (max.votes || 0) ? meme : max;
    },
    { name: null, votes: 0 }
  );
  console.log(`[DEBUG] Most voted meme: ${mostVotedMeme.name} with ${mostVotedMeme.votes} votes`);

  const roundLog = {
    progress: [],
    votes: [],
    winner: null,
  };

  const updatedMemes = memes.map((meme, index) => {
    console.log(`[DEBUG] Processing meme ${index + 1}/${memes.length}:`, meme);

    // Willekeurige voortgang tussen 5-10
    const randomProgress = Math.floor(Math.random() * 6) + 5;
    console.log(`[DEBUG] Random progress generated for ${meme.name}: ${randomProgress}`);

    let progress = meme.progress + randomProgress;
    console.log(`[DEBUG] Initial progress for ${meme.name}: ${meme.progress}, after random addition: ${progress}`);

    // 30% boost voor de meest gestemde meme
    if (meme.name === mostVotedMeme.name) {
      console.log(`[DEBUG] Applying 30% boost to ${meme.name}`);
      progress = Math.floor(progress * 1.3);
      console.log(`[DEBUG] Progress after boost for ${meme.name}: ${progress}`);
    }

    // Voeg progressie en stemmen toe aan het ronde-log
    roundLog.progress.push({ meme: meme.name, progress: randomProgress });
    roundLog.votes.push({ meme: meme.name, votes: meme.votes });

    return {
      ...meme,
      progress,
      votes: 0, // Reset stemmen voor de volgende ronde
    };
  });

  console.log('[DEBUG] roundLog.progress:', JSON.stringify(roundLog.progress, null, 2));

  // Bepaal de winnaar van de ronde
  const roundWinner = roundLog.progress.reduce((max, item) =>
    item.progress > max.progress ? item : max,
    { meme: null, progress: 0 }
  );

  roundLog.winner = roundWinner.meme;
  console.log(`[DEBUG] Round winner: ${roundLog.winner}`);

  // Debuglog voor de gehele ronde
  console.log('[DEBUG] Final Round Log:', JSON.stringify(roundLog, null, 2));

  return { updatedMemes, roundLog };
};

module.exports = { calculateProgressAndBoost };