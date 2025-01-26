const cron = require('node-cron');
const Race = require('../models/Race');

// Scheduler: Controleer elke minuut of een ronde moet eindigen
cron.schedule('* * * * *', async () => {
  console.log('Checking for races with expired rounds...');

  try {
    // Vind races waarvan de ronde is afgelopen
    const now = new Date();
    const races = await Race.find({ roundEndTime: { $lte: now }, status: { $ne: 'closed' } });

    for (const race of races) {
      console.log(`Ending round for race: ${race.raceId}`);

      // Bereken voortgang en boost voor memes
      const updatedMemes = calculateProgressAndBoost(race.memes);

      // Verhoog de ronde of sluit de race als dit de laatste ronde is
      if (race.currentRound < 6) {
        race.currentRound += 1;
        race.roundEndTime = new Date(now.getTime() + 3 * 60 * 1000); // Volgende ronde: 3 minuten vanaf nu
        race.memes = updatedMemes;
      } else {
        race.status = 'closed'; // Sluit de race
        race.memes = updatedMemes;
      }

      // Sla de wijzigingen op
      await race.save();
      console.log(`Race ${race.raceId} updated: Current Round = ${race.currentRound}, Status = ${race.status}`);
    }
  } catch (error) {
    console.error('Error in round scheduler:', error);
  }
});

// Functie om voortgang en boosts te berekenen
function calculateProgressAndBoost(memes) {
  // Vind de meme met de meeste stemmen
  const mostVotedMeme = memes.reduce((max, meme) => (meme.votes > (max.votes || 0) ? meme : max), {});

  return memes.map((meme) => {
    // Willekeurige progressie (bijvoorbeeld tussen 5 en 10 punten)
    const randomProgress = Math.floor(Math.random() * 6) + 5; // 5-10 punten
    let progress = meme.progress + randomProgress;

    // Geef een boost van 25% aan de meest gestemde meme
    if (meme.name === mostVotedMeme.name) {
      progress = Math.floor(progress * 1.25); // 25% boost
    }

    // Reset stemmen voor de volgende ronde
    return {
      ...meme,
      progress,
      votes: 0, // Reset votes
    };
  });
}