const Round = require('../models/Round');

// Haal alle rondes op voor een specifieke race
const getRoundsByRaceId = async (req, res) => {
  const { raceId } = req.params;

  try {
    const rounds = await Round.find({ raceId }).sort({ roundNumber: 1 }); // Sorteer op ronde-nummer
    if (!rounds.length) {
      return res.status(404).json({ message: `No rounds found for race ID ${raceId}` });
    }

    res.status(200).json(rounds);
  } catch (error) {
    console.error(`[ERROR] Failed to fetch rounds for race ID ${raceId}:`, error);
    res.status(500).json({ message: 'Failed to fetch rounds', error });
  }
};

module.exports = {
  getRoundsByRaceId,
};