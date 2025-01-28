const Race = require('../models/Race');
const Meme = require('../models/Meme');
const Participant = require('../models/Participant');
const Winner = require('../models/Winner');
const Round = require('../models/Round');
const { calculateProgressAndBoost } = require('../utils/raceUtils');

// Start een nieuwe race
const startRace = async (req, res) => {
  const { raceId } = req.body;

  try {
    const existingRace = await Race.findOne({ raceId });
    if (existingRace) {
      console.log(`[DEBUG] Race with ID ${raceId} already exists`);
      return res.status(400).json({ message: 'Race ID already exists' });
    }

    const randomMemes = await Meme.aggregate([{ $sample: { size: 6 } }]);
    if (randomMemes.length < 6) {
      console.log(`[DEBUG] Not enough memes in the database`);
      return res.status(400).json({ message: 'Not enough memes in the database' });
    }

    const race = new Race({
      raceId,
      memes: randomMemes.map((meme) => ({
        name: meme.name,
        url: meme.url,
        votes: 0,
        progress: 0,
      })),
      currentRound: 1,
      roundEndTime: new Date(Date.now() + 3 * 60 * 1000), // Eerste ronde eindigt na 3 minuten
    });

    await race.save();
    console.log(`[DEBUG] Race created successfully:`, race);
    res.status(201).json({ message: 'Race created successfully', race });
  } catch (error) {
    console.error('Error in startRace:', error);
    res.status(500).json({ message: 'Failed to create race' });
  }
};

// Haal racegegevens op
const getRace = async (req, res) => {
    const { raceId } = req.params;
  
    try {
      const race = await Race.findOne({ raceId }).populate('memes');
      if (!race) {
        console.log(`[DEBUG] Race with ID ${raceId} not found`);
        return res.status(404).json({ message: 'Race not found' });
      }
  
      // Haal de winnaar op uit de Winner-collectie
      const winner = await Winner.findOne({ raceId });
  
      // Haal de rondes op uit de Round-collectie
      const rounds = await Round.find({ raceId }).sort({ roundNumber: 1 });
  
      console.log(`[DEBUG] Fetched race data for ID ${raceId}`);
      res.status(200).json({
        ...race.toObject(),
        winner, // Voeg de winnaar toe aan de response
        rounds, // Voeg de rondes toe aan de response
      });
    } catch (error) {
      console.error('Error in getRace:', error);
      res.status(500).json({ message: 'Failed to fetch race details' });
    }
  };

// Verwerk een afgeronde ronde
const endRound = async (raceId) => {
    try {
      const race = await Race.findOne({ raceId }).populate('memes');
      if (!race || race.status === 'closed') {
        console.log(`[DEBUG] Race with ID ${raceId} is not found or already closed`);
        throw new Error('Race not found or already closed');
      }
  
      console.log(`[DEBUG] Processing round ${race.currentRound} for race ID ${raceId}`);
  
      const { updatedMemes, roundLog } = calculateProgressAndBoost(race.memes);
  
      // Maak een nieuw Round-document en sla op
      const round = new Round({
        raceId,
        roundNumber: race.currentRound,
        progress: roundLog.progress,
        winner: roundLog.winner,
        votes: roundLog.votes,
      });
      await round.save();
      console.log(`[DEBUG] Round ${race.currentRound} saved for race ID ${raceId}`);
  
      // Update de race
      if (race.currentRound < 6) {
        race.currentRound += 1;
        race.roundEndTime = new Date(Date.now() + 1 * 60 * 1000);
      } else {
        race.status = 'closed';
  
        // Bereken de winnaar en sla op in Winner-collectie
        const totalProgress = updatedMemes.map((meme) => ({
          name: meme.name,
          progress: meme.progress,
        }));
  
        const finalWinner = totalProgress.reduce((max, meme) =>
          meme.progress > max.progress ? meme : max
        );
  
        console.log(`[DEBUG] Final winner calculated for race ${raceId}:`, finalWinner);
  
        // Maak een nieuw Winner-document
        const winner = new Winner({
          raceId: race.raceId,
          winner: finalWinner.name,
          finalProgress: totalProgress,
        });
  
        await winner.save();
        console.log(`[DEBUG] Winner saved successfully for race ${raceId}`);
      }
  
      // Reset stemmen en update voortgang
      race.memes = updatedMemes.map((meme) => ({
        ...meme,
        votes: 0,
      }));
  
      await race.save();
      console.log(`[DEBUG] Race with ID ${raceId} saved successfully. Current status: ${race.status}`);
      return race;
    } catch (error) {
      console.error('[ERROR in endRound]:', error);
      throw error;
    }
  };

module.exports = {
  startRace,
  getRace,
  endRound,
};