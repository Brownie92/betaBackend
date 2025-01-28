const cron = require('node-cron');
const Race = require('../models/Race');
const Round = require('../models/Round');
const Winner = require('../models/Winner');
const { calculateProgressAndBoost } = require('../utils/raceUtils');

cron.schedule('* * * * *', async () => {
  console.log('[DEBUG] Checking for races with expired rounds...');

  try {
    const now = new Date();
    const races = await Race.find({
      roundEndTime: { $lte: now },
      status: { $ne: 'closed' },
    }).populate('memes');

    console.log(`[DEBUG] Found ${races.length} race(s) with expired rounds.`);

    for (const race of races) {
      console.log(`[DEBUG] Processing race: ${race.raceId}`);

      // Bereken progress en boost
      const { updatedMemes, roundLog } = calculateProgressAndBoost(race.memes, race.roundEndTime);

      // Voeg debuglog toe om zeker te zijn dat `roundLog` correct is gevuld
      console.log('[DEBUG] Generated roundLog:', JSON.stringify(roundLog, null, 2));

      // Voeg nieuwe ronde toe aan de `Round`-collectie
      const newRound = new Round({
        raceId: race.raceId,
        roundNumber: race.currentRound,
        progress: roundLog.progress, // Controleer dat dit correct is
        votes: roundLog.votes,
        winner: roundLog.winner,
      });

      console.log('[DEBUG] Creating new round with:', JSON.stringify({
        raceId: race.raceId,
        roundNumber: race.currentRound,
        progress: roundLog.progress,
        votes: roundLog.votes,
        winner: roundLog.winner,
      }, null, 2));

      // Opslaan van de ronde
      await newRound.save();
      console.log(`[DEBUG] Round ${race.currentRound} saved for race ${race.raceId}`);

      // Werk de race bij
      if (race.currentRound < 6) {
        race.currentRound += 1;
        race.roundEndTime = new Date(Date.now() + 3 * 60 * 1000); // Stel nieuwe ronde-tijd in
      } else {
        race.status = 'closed';

        // Bepaal de winnaar
        const totalProgress = updatedMemes.map((meme) => ({
          name: meme.name,
          progress: meme.progress,
        }));

        const finalWinner = totalProgress.reduce((max, meme) =>
          meme.progress > max.progress ? meme : max,
        );

        // Sla de winnaar op in de `Winner`-collectie
        const winner = new Winner({
          raceId: race.raceId,
          winner: finalWinner.name,
          finalProgress: totalProgress,
        });

        console.log(`[DEBUG] Saving final winner for race ${race.raceId}:`, JSON.stringify({
          raceId: race.raceId,
          winner: finalWinner.name,
          finalProgress: totalProgress,
        }, null, 2));

        await winner.save();
        console.log(`[DEBUG] Winner saved for race ${race.raceId}: ${finalWinner.name}`);
      }

      // Update de memes en sla de race op
      race.memes = updatedMemes.map((meme) => ({
        ...meme,
        votes: 0, // Reset stemmen voor de volgende ronde
      }));

      await race.save();
      console.log(`[DEBUG] Race ${race.raceId} updated: Current Round = ${race.currentRound}, Status = ${race.status}`);
    }
  } catch (error) {
    console.error('[ERROR in round scheduler]:', error);
  }
});