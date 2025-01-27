const Race = require('../models/Race');
const Participant = require('../models/Participant'); // Gebruik de aparte collectie

const voteForMeme = async (req, res) => {
  const { raceId } = req.params;
  const { wallet, votedMeme } = req.body;

  try {
    // Controleer of de race bestaat
    const race = await Race.findOne({ raceId });
    if (!race) {
      return res.status(404).json({ message: 'Race not found' });
    }

    // Controleer of de deelnemer bestaat in de aparte collectie
    const participant = await Participant.findOne({ raceId, wallet });
    if (!participant) {
      return res.status(400).json({ message: 'Wallet not registered for this race' });
    }

    // Controleer of de gekozen meme geldig is
    const meme = race.memes.find((m) => m.name === votedMeme);
    if (!meme) {
      return res.status(400).json({ message: `Invalid meme selection: ${votedMeme}` });
    }

    // Controleer of de deelnemer al heeft gestemd in deze ronde
    if (participant.votes && participant.votes.includes(race.currentRound)) {
      return res.status(400).json({ message: 'You have already voted in this round' });
    }

    // Voeg de stem toe aan de meme
    meme.votes += 1;

    // Markeer dat de deelnemer heeft gestemd in deze ronde
    if (!participant.votes) {
      participant.votes = [];
    }
    participant.votes.push(race.currentRound);

    // Sla de wijzigingen op in beide collecties
    await participant.save(); // Update de deelnemer
    await race.save(); // Update de race (stemmen in memes)

    res.status(200).json({ message: 'Vote registered successfully', votedMeme });
  } catch (error) {
    console.error('Error in voteForMeme:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { voteForMeme };